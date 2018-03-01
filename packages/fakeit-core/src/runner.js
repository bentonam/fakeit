// @flow

import DependencyResolver from 'dependency-resolver'
import globby from 'globby'
import Promise from 'bluebird'
import path from 'path'
import { isEmpty, find } from 'lodash'
// import _ from 'highland'
import FakeitError from './error'
import requirePkg from './require-pkg'
import type { ModelInterface } from './model'

// this function allows us to require each model without them being cached.
// basically without this each module would be exactly the same since we instatiate
// the Model class before we export it out
function requireFreshModel (file: string): ModelInterface {
  const cache = Object.keys(require.cache)

  // loop through the cache and delete
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
export function resolveDependenciesOrder (models: ModelInterface[] = []): ModelInterface[] {
  if (models.length <= 1) {
    return models
  }

  const resolver = new DependencyResolver()
  const order = {}

  for (const [ i, model ] of models.entries()) {
    order[model.file] = i
    resolver.add(model.file)
    for (const dependency of model.settings.dependencies) {
      resolver.setDependency(model.file, dependency)
    }
  }

  return resolver.sort()
    .map((file: string) => models[order[file]])
}

/// @name resolveDependenciesOf
/// @description Figures out which models use the model as a dependency
/// @arg {array} models [[]] - The models to loop over
/// @returns {array} - The models are returned with the `dependants`
export function resolveDependants (models: ModelInterface[] = []): ModelInterface[] {
  return models.map((model: Object) => {
    // loop over each model and find out which other models depend on the current model
    model.dependants = models.reduce((prev: string[], next: ModelInterface) => {
      if (
        // the next file in the loop doesn't matche the current models file
        model.file !== next.file &&
        // the next models dependencies includes the current models files
        next.settings.dependencies.includes(model.file)
      ) {
        prev.push(next.file)
      }
      return prev
    }, [])

    return model
  })
}

export default class Runner {
  api: Object

  constructor (api: Object) {
    this.api = api
  }

  async getModels (globs: string | string[]): Promise<ModelInterface[]> {
    if (isEmpty(globs)) {
      globs = this.api.settings.models
    }

    const registered = []
    let models: ModelInterface[] = []

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
          model.root = path.resolve(this.api.settings.root, path.dirname(model.file))

          // used to determin if something is a dependency or not.
          if (model.is_dependency == null) {
            model.is_dependency = dependency
          }

          model.settings.dependencies = this.api.resolveGlobs(
            model.settings.dependencies,
            model.root,
          )
          resolveFiles(model.settings.dependencies, true)
          models.push(model)
        }
      }
    }

    resolveFiles(await globby(this.api.resolveGlobs(globs), { cwd: this.api.settings.root }))

    models = resolveDependenciesOrder(models)
    models = resolveDependants(models)

    return models
  }

  async run (globs: string | string[]): Promise<void> {
    const models: ModelInterface[] = await this.getModels(globs)

    if (!models.length) {
      throw new FakeitError('no models were found to run')
    }
  }
}
