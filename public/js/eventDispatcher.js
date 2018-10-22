class Enumeration {
  constructor(obj) {
    for (const key in obj) {
      this[key] = obj[key]
    }
    return Object.freeze(this)
  }
  static has(key) {
    return this.hasOwnProperty(key)
  }
}

const EventID = new Enumeration({
  'ChangePoint': null,
  'ChangeCoinText': null
});

class EventDispatcher {
  constructor() {
    this.listeners = new Map();
  }

  registerListeners(eventID, callback) {
    if (!this.listeners.has(eventID)) {
      let listFunc = [];
      listFunc.push(callback);
      this.listeners.set(eventID, listFunc);
    }
  }

  postEvent(eventID, param = null) {
    let listFunc = this.listeners.get(eventID);
    if (listFunc != null) {
      for (let func of listFunc) {
        try {
          func(param);
        }
        catch(error) {
          console.error(error);
          var index = listFunc.indexOf(func);
          listFunc.splice(index, 1);
          // no listener remain, then delete this key
          if (listFunc.length == 0)
            this.listeners.delete(eventID);
        }
      }
    } else console.warn('No listener on this event: ' + eventID);
  }

  removeListener(eventID) {
    this.listener.delete(eventID);
  }
}
