import * as Constants from '../constants'
import { dispatchActionWithData } from './'

async function getDiskStuff (context) {
  const userList = await context.listUsernames().then(usernames =>
    Promise.all(
      usernames.map(username => {
        return context
          .pinLoginEnabled(username)
          .then(pinEnabled => ({ username, pinEnabled }))
      })
    )
  )

  const lastUser = await context.io.folder
    .file('lastuser.json')
    .getText() // setText for later. username
    .then(text => JSON.parse(text))
    .then(json => json.username)
    .catch(e => null)

  return { lastUser, userList }
}

export function getPreviousUsers (context) {
  return (dispatch, getState, imports) => {
    let context = imports.context
    let username = imports.username
    getDiskStuff(context).then(data => {
      let focusUser = username || data.lastUser
      if (data.lastUser) {
        data.usersWithPinList = []
        data.userList.forEach(function (element) {
          if (element.username === focusUser) {
            data.lastUser = {
              username: focusUser,
              pinEnabled: element.pinEnabled
            }
          }
          if (element.pinEnabled) {
            data.usersWithPinList.push(element.username)
          }
        }, this)
      }
      dispatch(dispatchActionWithData(Constants.SET_PREVIOUS_USERS, data))
    })
  }
}
