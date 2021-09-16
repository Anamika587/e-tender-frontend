<template>
  <div>
    <!-- <div
      class="area_1"
    >
      <div class="v-bar-holder">
        <div class="content-list">
          <section class="archived-section mb-2">
            <h4 class="common-heading">
              <div class="row">
                <div class="col">
                  MarketPlace Applications
                </div>
              </div>
            </h4>
            <div class="row offset-2">
              <div class="row">
                <form>
                  <h2>Upload File</h2>
                  Enter FileName to  upload : <input
                    id="files"
                    type="text"
                    v-model="inputFileName"
                  ><br>
                  <input
                    id="files"
                    @change="submitFile"
                    type="file"
                  >
                  <br>
                  <br>
                  <button
                    id="uploadtBtn"
                    @click.stop.prevent="uploadFile"
                  >
                    Upload
                  </button>
                  <span v-if="uploadedFilePath!==''">
                    Uploaded FilePath is : {{ uploadedFilePath }}
                  </span>
                  <h2>Download File</h2>
                  Enter FileURl to download : <input
                    id="files"
                    type="text"
                    v-model="fileURL"
                  ><br>
                  <br>
                  <button
                    id="downloadBtn"
                    @click.stop.prevent="downloadFile"
                  >
                    Download
                  </button>
                  <br>
                  <br>
                </form>
              </div>
            </div>
            <div class="row offset-2">
              Show Image
              <img
                width="200px"
                height="150px"
                :src="cdnBaserURl+'client2/loginIP.png'"
              >
            </div>
          </section>
        </div>
      </div>
    </div> -->
    <div class="container">
      <h3>MarketPlace Applications</h3>
      <div class="row text-left mt-3">
        <div class="col-sm-6">
          <div class="card p-3">
            <div class="form-group">
              <h5>Upload File</h5>
              <label for=""> Enter FileName to  upload</label>
              <input
                class="form-control mb-2"
                id="files"
                type="text"
                v-model="inputFileName"
              >
              <input
                class="form-control mb-2"
                id="files"
                @change="submitFile"
                type="file"
              >
              <button
                type="button"
                class="btn btn-primary btn-sm"
                id="uploadtBtn"
                @click.stop.prevent="uploadFile"
              >
                Upload
              </button>
              <br>
              <div v-if="uploadedFilePath">
                cdnServer :
                <input
                  class="form-control mb-2"
                  id="filesData"
                  v-model="uploadedFilePath.cdnServer"
                  type="text"
                  readonly
                >
                filePath :
                <textarea
                  class="form-control mb-2"
                  id="filesData"
                  rows="2"
                  cols="5"
                  v-model="uploadedFilePath.filePath"
                  readonly
                />
              </div>
            </div>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="card p-3">
            <div class="form-group">
              <h5>Download File</h5>
              <label for=""> Enter FileURl to download</label>
              <input
                id="files"
                type="text"
                v-model="fileURL"
                class="form-control mb-2"
              >
              <button
                id="downloadBtn"
                class="btn btn-primary btn-sm"
                @click.stop.prevent="downloadFile"
              >
                Download
              </button>
            </div>
            <div class="form-group">
              <label
                class="d-block"
                for=""
              > Show Image</label>
              <img
                width="200px"
                height="150px"
                :src="'http://10.4.0.119:3032/1T8hSbGxKTul1GnF3s6zp8kjk41/test/loginIP.png'"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MQLCdn from '@/plugins/mqlCdn.js'
import Vue from 'vue'
// import vueDropzone from 'vue2-dropzone'
// import axios from 'axios'
export default {
  // components: {
  //   vueDropzone
  // },
  data () {
    return {
      dropOptions: {
        url: 'https://httpbin.org/post',
        acceptedFiles: '.jpg, .png',
        maxFilesize: 2, // MB
        maxFiles: 3,
        chunking: true,
        chunkSize: 500, // Bytes
        thumbnailWidth: 150, // px
        thumbnailHeight: 150,
        addRemoveLinks: true,
        title: 'Upload zip'
      },
      inputFileName: '',
      fileURL: '',
      files: '',
      uploadedFilePath: '',
      cdnBaserURl: Vue.getCDNBaseURL()
    }
  },
  methods: {
    submitFile (event) {
      this.files = event.target.files[0]
    },
    uploadFile () {
      let formData = new FormData()
      formData.append('file', this.files) // append your file as 'file' in formdata.
      new MQLCdn()
        .enablePageLoader(true)
        // FIXED: change this to directory path
        .setDirectoryPath('/EtenderExcelUpload') // (optional field) if you want to save  file to specific directory path
        .setFormData(formData) // (required) sets file data
        .setFileName(this.inputFileName) // (optional field) if you want to set name to file that is being uploaded
        // FIXED: pass buckeyKey instead of name
        .setBucketKey('1yA2e9wXt5yZaVA3UaxkHrepKis') // (required) valid bucket key need to set in which file will be uploaded.
        .setPurposeId('1yA2VblwnD8OurdP4b2l6IXg0l9') // (required) valid purposeId need to set in which file will be uploaded.
        .setClientId('1yA2VblwnD8OurdP4b2l6IXg0l9') // (required) valid purposeId need to set in which file will be uploaded.
        .uploadFile('uploadtBtn').then(res => { // (required) this will upload file takes element id (optional param) which will be blocked while file upload..
          if (res.isValid()) {
            this.uploadedFilePath = res.uploadedFileURL() // returns uploaded file url..
            console.log('res cdn path', this.uploadedFilePath)
            this.$toasted.success('file uploaded.', {
              theme: 'bubble',
              position: 'top-center',
              duration: 5000
            })
          } else {
            res.showErrorToast()
          }
        })
    },
    downloadFile () {
      if (this.fileURL !== '') {
        new MQLCdn()
          .setCDNPath(this.fileURL) // (required) set a filepath whihch needs to be download.
          .setBucketKey('10')
          .setPurposeId('10') // (required) valid purposeId need to set in which file will be uploaded.
          .setClientId('26') // (required) if you are providing relative path
          .enablePageLoader(true)
          .downloadFile('downloadBtn').then(res => { // (required) this will take elemnt id (optional) which will be blocked while file being downloaded.
            if (!res.isValid()) {
              res.showErrorToast()
            }
          })
      }
    }

    // fileData (file) {
    //   this.files = file
    // }
  }
}
</script>

<style>

</style>
