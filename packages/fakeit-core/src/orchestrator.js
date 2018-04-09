// @flow

import DependencyResolver from 'dependency-resolver'
import globby from 'globby'
import Promise from 'bluebird'
import path from 'path'
import { isEmpty, find, reduce } from 'lodash'
import CallableTask from 'relieve/tasks/CallableTask'
import QueueWorker from 'relieve/workers/QueueWorker'
import _ from 'highland'
import FakeitError from './error'
import requirePkg from './require-pkg'
import RunStatus from './run-status'
import type { ModelInterface } from './model'
import type Api from './api'

interface ShallowModel {
  file: string;
  root: string;
  is_dependency: boolean;
  dependencies: Object[];
  inputs: Object[];
  dependants: Object[];
  task?: Object;
  status?: RunStatus;
}

// this function allows us to require each model without them being cached.
// basically without this each module would be exactly the same since we instatiate
// the Model class before we export it out
function requireFreshModel (file: string): ModelInterface {
  const cache = Object.keys(require.cache)

  // loop through the cache and delete the model cache.
  // that way it allows users to import the package and it's a
  // fresh instance every time
  for (const key of cache) {
    if (/(dist[/\\]+model[/\\]+|core[/\\]+dist[/\\]+)index.js/.test(key)) {
      delete require.cache[key]
    }
  }

  return requirePkg(file)
}

/// @name resolveDependenciesOrder
/// @description Resolves the dependency order that file models need to run in.
/// @arg {array} models [[]] - The models to prioritize
/// @returns {array}
/// The models are returned in order with all the models
/// that don't have dependencies first
export function resolveDependenciesOrder (models: ShallowModel[] = []): ShallowModel[] {
  if (models.length <= 1) {
    return models
  }

  const resolver = new DependencyResolver()
  const order = {}

  for (const [ i, model ] of models.entries()) {
    order[model.file] = i
    resolver.add(model.file)
    for (const dependency of model.dependencies) {
      resolver.setDependency(model.file, dependency.model)
    }
  }

  return resolver.sort()
    .map((file: string) => models[order[file]])
}

/// @name resolveDependenciesOf
/// @description Figures out which models use the model as a dependency
/// @arg {array} models [[]] - The models to loop over
/// @returns {array} - The models are returned with the `dependants`
export function resolveDependants (models: ShallowModel[] = []): ShallowModel[] {
  return models.map((model: Object) => {
    // loop over each model and find out which other models depend on the current model
    model.dependants = models.reduce((prev: string[], next: ShallowModel): string[] => {
      if (
        // the next file in the loop doesn't matche the current models file
        model.file !== next.file &&
        // the next models dependencies includes the current models files
        next.dependencies.some((dependency: Object) => dependency.model.includes(model.file))
      ) {
        prev.push(next.file)
      }
      return prev
    }, [])

    return model
  })
}

// this function removes any null/function values and remove the plugin key
function copyOptions (options: Object): Object {
  options = Object.assign({}, options)
  delete options.plugins
  return reduce(
    options,
    (prev: Object, value: mixed, key: string): Object => {
      if (Array.isArray(value)) {
        prev[key] = value.filter((item: mixed): boolean => typeof item !== 'function')
      } else if (value != null && typeof value !== 'function') {
        prev[key] = value
      }

      return prev
    },
    {},
  )
}

// - in the cli - run the api to get the cli plugins and other settings
// - create a task for each model
// - run the worker
// - in every fucking model - run the api to get the plugins and other settings
// - send a message to the parent of the dependencies to figure out

export default class Orchestrator {
  api: Api
  worker: QueueWorker
  models: ShallowModel[]

  constructor (api: Object) {
    this.api = api
  }

  async getModels (globs: string | string[]): Promise<ModelInterface[]> {
    if (isEmpty(globs)) {
      globs = this.api.settings.models
    }

    const registered = []

    let models: ShallowModel[] = []

    const resolveFiles = (files: string[], dependency: boolean = false): void => {
      for (const file of files) {
        if (registered.includes(file)) {
          if (!dependency) {
            const model = find(models, [ 'file', file ])
            if (model) {
              model.is_dependency = dependency
            }
          }
        } else {
          registered.push(file)

          const model: ModelInterface = requireFreshModel(file)
          model.file = file

          // @todo not sure how useful this is
          model.root = path.resolve(this.api.settings.root, path.dirname(model.file))

          // used to determin if something is a dependency or not.
          if (model.is_dependency == null) {
            model.is_dependency = dependency
          }

          const resolvePaths = (key: string): Function => {
            return (item: Object): Object => {
              item[key] = path.resolve(model.root, item[key])
              return item[key]
            }
          }

          const dependencies = model.settings.dependencies.map(resolvePaths('model'))
          model.settings.inputs.map(resolvePaths('input'))

          resolveFiles(dependencies, true)

          models.push({
            file: model.file,
            root: model.root,
            is_dependency: model.is_dependency,
            dependencies: model.settings.dependencies,
            inputs: model.settings.inputs,
            dependants: [],
            status: new RunStatus(),
          })
        }
      }
    }

    this.api.settings.models = await globby(this.api.resolveGlobs(globs), {
      cwd: this.api.settings.root,
    })
    resolveFiles(this.api.settings.models)

    models = resolveDependenciesOrder(models)
    models = resolveDependants(models)

    return models
  }

  queueModels (): void {
    this.worker = new QueueWorker({ concurrency: this.api.settings.threads })

    // get the options that were passed in from the cli and
    // pass them through to the tasks
    const options = copyOptions(this.api.settings)

    const streams = []

    this.models
      // .slice(0, 1)
      .forEach((model: ShallowModel) => {
        const task = new CallableTask(`${__dirname}/task.js`)
        task.name = model.file
        task.arguments = [ { ...model, options } ]
        const stream = _('document', task)
          .map((document: mixed) => {
            return {
              file: model.file,
              document,
            }
          })
        streams.push(stream)
        task.on('document', (document: string) => {
          // create some outputter stream
          stream.write(document)
        })
        model.task = task
        this.worker.add(task)
      })

    _(streams)
      .merge()
      .each((document: mixed) => {
        console.log('merged stream:', document)
      })
  }

  async run (globs: string | string[]): Promise<void> {
    this.models = await this.getModels(globs)

    if (!this.models.length) {
      throw new FakeitError('no models were found to run')
    }

    this.queueModels()

    this.worker.run()

    // unknown as to why this has to be in here for it to do anything
    setTimeout(async () => {
      // this will need to be a writer stream so that it pulls new values
      // this class could potentially have a run-status for all the models
      // to make it easier
      await this.models[0].task.call('createDocument')
    })

    setTimeout(() => {
      process.exit(0)
    }, 80000)
  }
}
