var post=function (reluri, body,success,error)
{
  fetch(reluri,{
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(body)
  })
    .then(success)
    .catch(error)
}
var get=function(reluri,success,error)
{
  fetch(reluri,{
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  })
    .then(success)
    .catch(error)
}
var include = function(path,cb)
{
  get(window.IncludePath+path,(data)=>{
    data.text().then((code)=>{
      eval(code)
      cb()
    }).catch(()=>{
      throw "there was an error including "  + path;
    })
  },()=>{
    throw "there was an error including "  + path;
  })
}

var incpath = function(path)
{
  return `${window.IncludePath}/${path}`
}
