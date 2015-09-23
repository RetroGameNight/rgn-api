import swaggerValidate from 'swagger-validate'
import _ from 'lodash'

export function isValid(object, model) {
  const validationErrors = swaggerValidate.model(object, model)
  if (validationErrors 
      || _.difference(_.keys(object), _.keys(model.properties)).length) {
    return false
  } else {
    return true
  }
}