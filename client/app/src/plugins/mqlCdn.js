import axios from 'axios'
import Response from '@/plugins/response.js'
import Vue from 'vue'

class MQLCdn {
  constructor () {
    // eslint-disable-next-line
    let cancel
    let requestProcessedWithoutErrorCode = 1000
    let isDevelopment = process.env.NODE_ENV !== 'production'
    this.fileName = ''
    this.formData = new FormData()
    this.formData.set('enctype', 'multipart/form-data')
    this.clientId = ''
    this.bucketId = ''
    this.isPrivateBucket = false
    this.cdnURL = ''
    this.cdnPath = ''
    this.directoryPath = ''
    this.forceCreateDirectory = true
    this.showPageLoader = false
    this.GateWayConfigObj = {}
    this.savedConfig = {}
    let CancelToken = axios.CancelToken
    const mqlInstance = axios.create({
      baseURL: Vue.getCDNBaseURL()
    })

    // To set cdnPath and authorization header in request
    const setHeaders = (headers = {}) => {
      headers['Authorization'] = 'Bearer ' + sessionStorage.getItem('user-token')
      if (this.directoryPath) {
        headers['directoryPath'] = this.directoryPath
      }
      return headers
    }

    // To set the bucket config data in multipart formrequest data to send to cdn
    const setBucketConfigInFormData = (data) => {
      this.formData.append('BucketId', data.bucketId)
      this.formData.append('JWTKey', data.jwtKey)
      this.formData.append('IsPrivateBucket', data.isPrivateBucket)
      this.formData.append('forceCreateDirectory', this.forceCreateDirectory)
    }

    // To get the filename from the request url for download
    const getFilenameFromUrl = (url) => {
      const pathname = decodeURIComponent(new URL(url).pathname)
      const index = pathname.lastIndexOf('/')
      return (index !== -1 ? pathname.substring(index + 1) : pathname)
    }

    // To prepare the post request to gateway server of cdn
    const prepareMQLCDNGatewayRequest = (requestType, docId, txt) => {
      return new Promise((resolve) => {
        if (this.GateWayConfigObj && this.GateWayConfigObj.purposeId && this.bucketId) {
          mqlInstance({
            url: this.cdnURL,
            method: requestType,
            headers: setHeaders(),
            data: this.GateWayConfigObj,
            cancelToken: new CancelToken(function executor (c) {
              cancel = c
            })
          })
            .then(res => {
              let obj = {}
              obj.data = {}
              obj.data.errorCode = 1000
              obj.data.result = res.data.result
              if (res.data.errorCode !== requestProcessedWithoutErrorCode) {
                if (this.showPageLoader) {
                  window.app.$store.dispatch('app/MUTATE_PAGE_BLOCKER', false)
                }
                if (docId !== null && document.getElementById(docId) !== null) {
                  document.getElementById(docId).disabled = false
                  document.getElementById(docId).innerHTML = txt
                }
                obj.data.error = res.data.error
                obj.data.errorCode = res.data.errorCode
                obj.data.result = null
                resolve(new Response(obj))
              } else {
                resolve(new Response(obj))
              }
            })
            .catch(error => {
              console.log('fail error', error.message)
              let obj = {}
              obj.data = {}
              if (docId !== null && document.getElementById(docId) !== null) {
                document.getElementById(docId).disabled = false
                document.getElementById(docId).innerHTML = txt
              }
              if (this.showPageLoader) {
                window.app.$store.dispatch('app/MUTATE_PAGE_BLOCKER', false)
              }
              obj.data.error = error.message
              obj.data.errorCode = 1990
              obj.data.result = null
              resolve(new Response(obj))
            })
        } else {
          if (docId !== null && document.getElementById(docId) !== null) {
            document.getElementById(docId).disabled = false
            document.getElementById(docId).innerHTML = txt
          }
          let obj = {}
          obj.data = {}
          obj.data.error = 'Bucket or Purpose Key cannot be empty.'
          obj.data.errorCode = 1990
          obj.data.result = null
          resolve(new Response(obj))
        }
      }).catch(error => {
        // Handling development related errors
        console.log(error)
        if (isDevelopment) {
          alert(error)
        }
      })
    }

    // To prepare post request to actual cdn server
    const prepareMQLCDNRequest = (requestType, cdnURL, cdnurlWithoutroute, docId, txt) => {
      return new Promise((resolve) => {
        // client side file size check
        if (this.bucketId !== undefined) {
          if (this.savedConfig.maxFileSize && this.formData.get('file') && this.formData.get('file').size > this.savedConfig.maxFileSize) {
            if (docId !== null && document.getElementById(docId) !== null) {
              document.getElementById(docId).disabled = false
              document.getElementById(docId).innerHTML = txt
            }
            let obj = {}
            obj.data = {}
            obj.data.error = 'File size exceeds the maximum limit of ' + this.savedConfig.maxFileSize / (1024 * 1024) + ' MB.'
            obj.data.errorCode = 1990
            obj.data.result = null
            return resolve(new Response(obj))
          } else if (!this.savedConfig.maxFileSize && this.formData.get('file') && this.formData.get('file').size > (15 * 1024 * 1024)) {
            if (docId !== null && document.getElementById(docId) !== null) {
              document.getElementById(docId).disabled = false
              document.getElementById(docId).innerHTML = txt
            }
            let obj = {}
            obj.data = {}
            obj.data.error = 'File size exceeds the default limit of 15 MB.'
            obj.data.errorCode = 1990
            obj.data.result = null
            return resolve(new Response(obj))
          }

          mqlInstance({
            url: cdnURL,
            method: requestType,
            headers: setHeaders(),
            data: this.formData,
            cancelToken: new CancelToken(function executor (c) {
              cancel = c
            })
          })
            .then(res => {
              let obj = {}
              obj.data = {}
              obj.data.errorCode = 1000
              obj.data.result = res.data.result
              if (res.data.errorCode !== requestProcessedWithoutErrorCode) {
                obj.data.errorCode = res.data.errorCode
                obj.data.error = res.data.error
                if (this.showPageLoader) {
                  window.app.$store.dispatch('app/MUTATE_PAGE_BLOCKER', false)
                }
                if (docId !== null && document.getElementById(docId) !== null) {
                  document.getElementById(docId).disabled = false
                  document.getElementById(docId).innerHTML = txt
                }
              } else {
                res.data.result.cdnServer = cdnurlWithoutroute
              }
              resolve(new Response(obj))
            })
            .catch(error => {
              console.log('fail error', error.message)
              let obj = {}
              obj.data = {}
              if (docId !== null && document.getElementById(docId) !== null) {
                document.getElementById(docId).disabled = false
                document.getElementById(docId).innerHTML = txt
              }
              if (this.showPageLoader) {
                window.app.$store.dispatch('app/MUTATE_PAGE_BLOCKER', false)
              }
              obj.data.error = error.message
              obj.data.errorCode = 1990
              obj.data.result = null
              resolve(new Response(obj))
            })
        } else {
          if (docId !== null && document.getElementById(docId) !== null) {
            document.getElementById(docId).disabled = false
            document.getElementById(docId).innerHTML = txt
          }
          let obj = {}
          obj.data = {}
          obj.data.error = 'Invalid Bucket Key ' + this.bucketId
          obj.data.errorCode = 1990
          obj.data.result = null
          resolve(new Response(obj))
        }
      }).catch(error => {
        // Handling development related errors
        console.log(error)
        if (isDevelopment) {
          alert(error)
        }
      })
    }

    const checkCdnURLPresentForPurposeId = () => {
      return new Promise((resolve) => {
        let result = Vue.getServerList(this.GateWayConfigObj.purposeId, this.GateWayConfigObj.bucketConfig[0].bucketId)
        if (result) {
          this.savedConfig = result
          resolve(true)
        } else {
          resolve(false)
        }
      })
    }

    // To route request to actual cdn server
    const uploadFileToCDN = (docId = null, cdnURL = '') => {
      let cdnurlWithoutroute = cdnURL
      cdnURL = cdnURL + '/uploadfile'
      let txt = ''
      if (this.showPageLoader) {
        window.app.$store.dispatch('app/MUTATE_PAGE_BLOCKER', true)
      }
      return new Promise((resolve) => {
        if (docId !== null && document.getElementById(docId) !== null) {
          txt = document.getElementById(docId).innerHTML
          document.getElementById(docId).disabled = true
          document.getElementById(docId).innerHTML = 'Processing'
        }
        prepareMQLCDNRequest('POST', cdnURL, cdnurlWithoutroute, docId, txt).then(cdnResponse => {
          if (this.showPageLoader) {
            window.app.$store.dispatch('app/MUTATE_PAGE_BLOCKER', false)
          }
          if (docId !== null && document.getElementById(docId) !== null) {
            document.getElementById(docId).disabled = false
            document.getElementById(docId).innerHTML = txt
          }
          resolve(cdnResponse)
        })
      }).catch(error => {
        // Handling development related errors
        console.log(error)
        if (isDevelopment) {
          alert(error)
        }
      })
    }

    // To set the filename in formData of multipart request
    this.setFileName = (fileName) => {
      if (fileName !== '' && fileName !== undefined) {
        this.fileName = fileName.trim()
        this.formData.append('fileName', this.fileName)
      } else {
        this.fileName = ''
      }
      return this
    }

    // To set the path of file to be saved in
    this.setCDNPath = (cdnPath) => {
      this.cdnPath = cdnPath
      return this
    }
    // To set the path of file to be saved in
    this.setDirectoryPath = (directoryPath, forceCreate = true) => {
      this.directoryPath = directoryPath
      this.forceCreateDirectory = forceCreate
      return this
    }

    // To prepare formData
    this.setFormData = (formData) => {
      this.formData = formData
      return this
    }

    // To activate page loader while request completes processing
    this.enablePageLoader = function (boolShowPageLoader = false) {
      this.showPageLoader = boolShowPageLoader
      return this
    }

    // To get the bucket config from bucket name
    this.setBucketKey = (bucketId) => {
      this.bucketId = bucketId
      // fetchBucketConfigFromKey(bucketId)
      this.GateWayConfigObj.bucketConfig = []
      let data = {
        'bucketId': bucketId
      }
      this.GateWayConfigObj.bucketConfig.push(data)
      return this
    }

    // To set the purposeId for cdn
    this.setPurposeId = (purposeId) => {
      this.GateWayConfigObj.purposeId = purposeId
      return this
    }

    // To set the clientId for cdn
    this.setClientId = (clientId) => {
      this.GateWayConfigObj.clientId = clientId
      return this
    }

    // To set the userId for cdn
    this.setUserId = (userId) => {
      this.GateWayConfigObj.userId = userId
      return this
    }

    const getFileFromCDN = (cdnURL = '') => {
      return new Promise((resolve) => {
        mqlInstance({
          url: cdnURL,
          method: 'GET',
          headers: setHeaders(),
          responseType: 'blob',
          cancelToken: new CancelToken(function executor (c) {
            cancel = c
          })
        })
          .then(res => {
            this.fileName = getFilenameFromUrl(this.cdnURL)
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/octet-stream' }))
            var a = document.createElement('a')
            a.href = url
            a.download = this.fileName
            a.target = '_blank'
            a.click()
          })
          .catch(error => {
            console.log('fail error', error.message)
            let obj = {}
            obj.data = {}
            if (this.showPageLoader) {
              window.app.$store.dispatch('app/MUTATE_PAGE_BLOCKER', false)
            }
            obj.data.error = error.message
            obj.data.errorCode = 1990
            obj.data.result = null
            resolve(new Response(obj))
          })
      }).catch(error => {
        // Handling development related errors
        console.log(error)
        if (isDevelopment) {
          alert(error)
        }
      })
    }

    this.uploadFile = (docId = null) => {
      this.cdnURL = 'o/getCdnConfig'
      let txt = ''
      let obj = {}
      obj.data = {}
      if (this.showPageLoader) {
        window.app.$store.dispatch('app/MUTATE_PAGE_BLOCKER', true)
      }
      return new Promise((resolve) => {
        if (docId !== null && document.getElementById(docId) !== null) {
          txt = document.getElementById(docId).innerHTML
          document.getElementById(docId).disabled = true
          document.getElementById(docId).innerHTML = 'Processing'
        }
        checkCdnURLPresentForPurposeId().then(res => {
          if (this.showPageLoader) {
            window.app.$store.dispatch('app/MUTATE_PAGE_BLOCKER', false)
          }
          if (docId !== null && document.getElementById(docId) !== null) {
            document.getElementById(docId).disabled = false
            document.getElementById(docId).innerHTML = txt
          }
          if (res) {
            setBucketConfigInFormData(this.savedConfig)
            uploadFileToCDN(docId, this.savedConfig.cdnURL).then(cdnres => {
              obj.data = cdnres.raw
              resolve(new Response(obj))
            })
          } else {
            prepareMQLCDNGatewayRequest('POST', docId, txt).then(gatewayRes => {
              if (gatewayRes.raw.errorCode !== requestProcessedWithoutErrorCode) {
                resolve(gatewayRes)
              } else {
                // TODO: check if working witout setting purpose id
                // gatewayRes.raw.result.purposeId = this.GateWayConfigObj.purposeId
                Vue.setServerList(gatewayRes.raw.result)
                this.savedConfig = gatewayRes.raw.result
                setBucketConfigInFormData(this.savedConfig)
                uploadFileToCDN(docId, this.savedConfig.cdnURL).then(cdnres => {
                  obj.data = cdnres.raw
                  resolve(new Response(obj))
                })
              }
            })
          }
        })
      }).catch(error => {
        // Handling development related errors
        console.log(error)
        if (isDevelopment) {
          alert(error)
        }
      })
    }

    this.downloadFile = (docId = null) => {
      let txt = ''
      if (this.showPageLoader) {
        window.app.$store.dispatch('app/MUTATE_PAGE_BLOCKER', true)
      }
      if (docId !== null && document.getElementById(docId) !== null) {
        txt = document.getElementById(docId).innerHTML
        document.getElementById(docId).disabled = true
        document.getElementById(docId).innerHTML = 'Processing'
      }

      return new Promise((resolve) => {
        if (this.cdnPath.includes('http://') || this.cdnPath.includes('https://')) {
          // if full path is  available
          this.cdnURL = this.cdnPath
          getFileFromCDN(this.cdnURL).then(res => {
            resolve(res)
          })
        } else {
          // check in cache for cdn url
          checkCdnURLPresentForPurposeId().then(res => {
            if (res) {
              // cdn config found in cache
              this.cdnURL = this.savedConfig.cdnURL
            } else {
              // add cdnbase url to call cdn gateway.
              this.cdnURL = 'o/getCdnConfig'

              prepareMQLCDNGatewayRequest('POST', docId, txt).then(res => {
                if (res.raw.errorCode !== requestProcessedWithoutErrorCode) {
                  resolve(res)
                } else {
                  // cdnUrl from gateway
                  this.cdnURL = res.raw.result.cdnURL
                }
              })
            }
            // complete cdn file path
            this.cdnURL = this.cdnURL + '/' + this.cdnPath
            getFileFromCDN(this.cdnURL).then(res => {
              resolve(res)
            })
          })
        }
        if (this.showPageLoader) {
          window.app.$store.dispatch('app/MUTATE_PAGE_BLOCKER', false)
        }
        if (docId !== null && document.getElementById(docId) !== null) {
          document.getElementById(docId).disabled = false
          document.getElementById(docId).innerHTML = txt
        }
      }).catch(error => {
        // Handling development related errors
        console.log(error)
        if (isDevelopment) {
          alert(error)
        }
      })
    }
  }
}
export default MQLCdn
