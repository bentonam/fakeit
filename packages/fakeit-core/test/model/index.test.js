import ava from 'ava-spec'

import fakeit from '../../dist/model'

const test = ava.group('model:index')

test.skip('testing', (t) => {
  const details = fakeit.object({
    prefix: fakeit.build((t) => t.$chance.prefix())
      .odds(5),
    first_name: fakeit.build((t) => t.$faker.name.firstName()),
    middle_name: fakeit
      .build((t) => {
        return t.$chance.name({ middle: true })
          .split(' ')[1]
      })
      .odds(70),
    last_name: fakeit.build((t) => {
      return t.$chance.bool({ likelihood: 70 }) ? t.$faker.name.lastName() : null
    }),
    company: fakeit.build((t) => {
      return t.$chance.bool({ likelihood: 30 }) ? t.$faker.company.companyName() : null
    }),
    job_title: fakeit.build((t) => {
      return t.$chance.bool({ likelihood: 30 }) ? t.$faker.name.jobTitle() : null
    }),
    dob: fakeit.build((t) => {
      return t.$chance.bool() ? new Date(t.$faker.date.past())
        .toISOString()
        .split('T')[0] : null
    }),
    nickname: fakeit.build((t) => {
      return t.$chance.bool({ likelihood: 10 }) ? t.$faker.random.word() : null
    }),
  })
  const actual = fakeit
    .options({
      name: 'Contacts',
      key: '_id',
      min: 1,
      max: 4,
      before () {}, // before any documents get generated
      beforeEach () {}, // before
    })
    .object({
      _id: fakeit.after(() => `contact_${fakeit.ref('contact_id')}`),
      doc_type: 'contact',
      channels: [ 'ufp-555555555' ],
      contact_id: fakeit.build((t) => t.$chance.guid()),
      created_on: fakeit.build((t) => {
        return new Date(t.$faker.date.past())
          .getTime()
      }),
      modified_on: fakeit.build((t) => {
        return new Date(t.$faker.date.recent())
          .getTime()
      }),

      foo: fakeit
        .array()
        .items(fakeit.build((t) => t.$faker))
        .min(1)
        .max(10),
      details,
    })

  console.log('actual:', actual.inner.value._id)

  t.pass()
})

test.only('something', (t) => {
  console.log(fakeit)
  t.pass()
})
