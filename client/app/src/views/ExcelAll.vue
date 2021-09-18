<template>
  <div>
    <section>
      <h3>Create XLSX</h3>
      <div>
        <input v-model="sheetName" placeholder="type a new sheet name" />
        <button v-if="sheetName" @click="addSheet">Add Sheet</button>
      </div>

      <div>Sheets: {{ sheets }}</div>

      <xlsx-workbook>
        <xlsx-sheet
          :collection="sheet.data"
          v-for="sheet in sheets"
          :key="sheet.name"
          :sheet-name="sheet.name"
        />
        <xlsx-download>
          <button>Download</button>
        </xlsx-download>
      </xlsx-workbook>
    </section>
    <hr />
    <section>
      <h3>Import XLSX</h3>
      <input type="file" @change="onChange" />
      <xlsx-read :file="file"> 
        <xlsx-sheets>
          <template #default="{sheets}">
            <select v-model="selectedSheet">
              <option v-for="sheet in sheets" :key="sheet" :value="sheet">
                {{ sheet }}
              </option>
            </select>
          </template>
        </xlsx-sheets>
        <xlsx-table :sheet="selectedSheet" style="height: 400px; overflow-y: auto; margin:2em auto 2em;" />
        <xlsx-json :sheet="selectedSheet">
          <template #default="{collection}">
            <button @click="setData(collection)">Upload Data</button>
          </template>
        </xlsx-json>
      </xlsx-read>
    </section>
  </div>
</template>

<script>
import { XlsxRead, XlsxTable, XlsxSheets, XlsxJson, XlsxWorkbook, XlsxSheet, XlsxDownload } from "vue-xlsx"

export default {
    name : 'excelAll',
  components: {
    XlsxRead,
    XlsxTable,
    XlsxSheets,
    XlsxJson,
    XlsxWorkbook,
    XlsxSheet,
    XlsxDownload
  },
  data() {
    return {
      file: null,
      selectedSheet: null,
      sheetName: null,
      sheets: [{ name: "SheetOne", data: [{ c: 2 }] }],
      collection: [{ a: 1, b: 2 }],
      collectionData : null,
    };
  },
  methods: {
    onChange(event) {
      this.file = event.target.files ? event.target.files[0] : null;
    },
    setData(colData) {
      console.log("Here");
      console.log(colData);
    },
    addSheet() {
      this.sheets.push({ name: this.sheetName, data: [...this.collection] });
      this.sheetName = null;
    }
  },
  watch : {
    collection(newVal, oldVal) {
      console.log(newVal, oldVal);
    }
  }
};
</script>
