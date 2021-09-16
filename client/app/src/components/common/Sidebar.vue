<template>
  <div id="sidebar" :class="{ active: isActive }">
    <div class="sidebar-header">
      <img src="../../assets/logo_mkcl_w.svg" class="logo" />
    </div>

    <div class="custom-menu">
      <button
        type="button"
        id="sidebarCollapse"
        class="btn btn-primary"
        @click="toggleSideBar()"
      >
        <i class="mdi mdi-menu"></i>
        <span class="sr-only">Toggle Menu</span>
      </button>
    </div>

    <div v-bar>  
      <div class="sidebar-vbar">
        <ul>
          <!-- <template v-for="(page, i) in this.$router.options.routes">
            <li :key="i">
              <b-link :to="page.path"
                ><i class="sidebar-icon" :class="page.meta.icon"></i>
                {{ page.name }}</b-link
              >
            </li>
          </template> -->

          <li>
            <router-link to="/"><i class="mdi mdi-home-outline sidebar-icon"></i> Home</router-link>
          </li>

           <li>
            <router-link to="/mqlRequestDemo"><i class="mdi mdi-presentation-play sidebar-icon"></i> mqlRequestDemo</router-link>
          </li>

           <li>
            <router-link to="/cdnUpload"><i class="mdi mdi-upload sidebar-icon"></i> CdnUpload</router-link>
          </li>

           <li>
            <router-link to="/MqlAssetFDBDemo"><i class="mdi mdi-database-plus sidebar-icon"></i> MqlAssetFDBDemo</router-link>
          </li>
        </ul>
      </div>     
    </div>
  </div>
</template>

<script>
export default {
  name: "Sidebar",
  data: function() {
    return {
      isActive: false
    };
  },
  methods: {
    toggleSideBar() {
      this.isActive = !this.isActive;
    }
  }
};
</script>

<style></style>
