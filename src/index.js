import { createAction } from 'redux-act'
import { createReducer } from 'redux-act'

export class API {
  constructor(baseurl, name) {
    this.baseurl = baseurl
    this.name = name
    this.url = `${baseurl}/${name}`

    this.actions = {
      list: this.createActions(`${name} list`),
      get: this.createActions(`${name} get`),
      update: this.createActions(`${name} update`),
      create: this.createActions(`${name} create`),
      delete: this.createActions(`${name} delete`)
    }

    this.handlers = {
      [this.actions.list.request]: this.requestHandler,
      [this.actions.list.success]: this.listSuccessHandler,
      [this.actions.list.failure]: this.failureHandler,

      [this.actions.create.request]: this.requestHandler,
      [this.actions.create.success]: this.createSuccessHandler,
      [this.actions.create.failure]: this.failureHandler,

      [this.actions.update.request]: this.requestHandler,
      [this.actions.update.failure]: this.failureHandler,
      [this.actions.update.success]: this.updateSuccessHandler,

      [this.actions.delete.request]: this.requestHandler,
      [this.actions.delete.failure]: this.failureHandler,
      [this.actions.delete.success]: this.deleteSuccessHandler
    }

    this.initState = {
      isFetching: false,
      error: undefined,
      objects: []
    }

    this.reducer = createReducer(this.handlers, this.initState)
  }

  createActions = name => {
    return {
      request: createAction(`${name} request`.toUpperCase()),
      success: createAction(`${name} success`.toUpperCase()),
      failure: createAction(`${name} failure`.toUpperCase())
    }
  }

  requestHandler = (state) => {
    console.log('requetHandler')
    return {
      ...state,
      error: undefined,
      isFetching: true
    }
  }

  failureHandler = (state, error) => {
    return {
      ...state,
      isFetching: false,
      error
    }
  }

  listSuccessHandler  = (state, objects) => {
    return {
      error: undefined,
      isFetching: false,
      objects
    }
  }

  createSuccessHandler = (state, obj) => {
    return {
      error: undefined,
      isFetching: false,
      objects: [
        ...state.objects,
        obj
      ]
    }
  }

  updateSuccessHandler = (state, obj) => {
    return {
      error: undefined,
      isFetching: false,
      objects: state.objects.map(o => {
        if (o.id === obj.id) {
          return obj
        }
        return o
      })
    }
  }

  deleteSuccessHandler = (state, id) => {
    return {
      error: undefined,
      isFetching: false,
      objects: state.objects.filter(obj => obj.id !== id)
    }
  }

  dispatchAPI(actions, callAPI) {
    return dispatch => {
      const { request, success, failure } = actions
      dispatch(request())
      return callAPI()
      .then(response => {
        if (response.ok) {
          return response
        }
        throw Error(response.statusText)
      })
      .then(response => response.json())
      .then(json => dispatch(success(json)))
      .catch(error => dispatch(failure(error)))
    }
  }

  list = () => {
    return this.dispatchAPI(this.actions.list, () => fetch(this.url))
  }

  create = obj => {
    return this.dispatchAPI(this.actions.create, () => {
      const method = 'POST'
      const body = JSON.stringify(obj)
      return fetch(this.url, {
        method,
        body
      })
    })
  }

  update = (id, obj) => {
    return this.dispatchAPI(this.actions.update, () => {
      const method = 'PUT'
      const body = JSON.stringify(obj)
      return fetch(`${this.url}/${id}`, {
        method,
        body
      })
    })
  }

  delete = id => {
    return dispatch => {
      const { request, success, failure } = this.actions.delete
      dispatch(request())
      return fetch(`${this.url}/${id}`, {
        method: 'DELETE',
      })
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText)
        }
      })
      .then(() => dispatch(success(id)))
      .catch(error => dispatch(failure(error)))
    }
  }
}

export const createAPI = (baseurl, name) => new API(baseurl, name)

export default API
