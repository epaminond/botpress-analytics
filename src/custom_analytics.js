import moment from 'moment'
import _ from 'lodash'

module.exports = ({ bp }) => {

  async function increment(name, count = 1, racing = false) {
    if (!_.isString(name)) {
      throw new Error('Invalid name, expected a string')
    }

    if (!_.isNumber(count)) {
      throw new Error('Invalid count increment, expected a valid number')
    }

    const knex = await bp.db.get()

    const today = moment().format('YYYY-MM-DD')
    name = name.toLowerCase().trim()

    const countQuery = (count < 0)
      ? ('count - ' + Math.abs(count))
      : ('count + ' + Math.abs(count))

    const result = await knex('analytics_custom')
    .where('date', today)
    .andWhere('name', name)
    .update('count', knex.raw(countQuery))
    .then()

    if (result == 0 && !racing) {
      await knex('analytics_custom')
      .insert({
        'name': name,
        'date': today,
        'count': count
      })
      .catch(err => {
        return increment(name, count, true)
      })
    }
  }

  async function decrement(name, count = 1) {
    return increment(name, count * -1)
  }

  return { increment, decrement }
}
