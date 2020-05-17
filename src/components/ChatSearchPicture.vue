<template>
    <mu-container>
        <mu-row>
            <mu-col span="11">
                <mu-text-field
                        :value="searchPictureKeyword"
                        @input="updateSearchKeyword"
                        @keydown.enter="search"
                        placeholder="请输入关键字搜索..."
                        color="#009688"
                        class="width-size-100" style="text-align: center"></mu-text-field>
            </mu-col>
            <mu-col span="1">
                <mu-button class="search_btn" icon @click="search">
                    <mu-icon value="search"></mu-icon>
                </mu-button>
            </mu-col>
        </mu-row>
        <mu-row>
            <mu-grid-list class="gridlist-demo">
                <mu-col span="4" sm="4" md="3" lg="2" xl="2" v-for="(item, index) in searchPictureData"
                        style="position: relative">
                    <img :src="item.url" style="width: 100%">
                    <div style="position: absolute; bottom: 0; width: 100%; text-align: right; background-color: rgba(0, 0, 0, 0.75);">
                        <mu-button slot="action" icon @click="send(item.url)">
                            <mu-icon value="send"></mu-icon>
                        </mu-button>
                    </div>
                </mu-col>
            </mu-grid-list>
        </mu-row>
        <mu-row>
            <mu-flex justify-content="center">
                <mu-pagination :total="searchPictureCount" :current.sync="paginationCurrent" :page-count="5"
                               :page-size="paginationLimit" @change="paginationChange"></mu-pagination>
            </mu-flex>
        </mu-row>
    </mu-container>
</template>

<script>

    import {mapGetters} from 'vuex'

    export default {
        name: "ChatSearchPicture",
        computed: {
            ...mapGetters({
                searchPictureKeyword: 'getSearchPictureKeyword',
                searchPictureData: 'getSearchPictureData',
                searchPictureCount: 'getSearchPictureCount'
            })
        },
        data: () => ({
            paginationTotal: 100,
            paginationCurrent: 1,
            paginationLimit: 20
        }),
        methods: {
            updateSearchKeyword: function (value) {
                this.$store.commit('setSearchPictureKeyword', value);
            },
            search: function () {
                console.log(`搜索图片`);
                this.paginationCurrent = 1;
                let stompClient = this.$store.getters.getStompClient;
                stompClient.send('/chat/picture/search', {}, JSON.stringify({
                    content: this.$store.getters.getSearchPictureKeyword,
                    sendTime: Date.now(),
                    pageSize: this.paginationLimit,
                    pageIndex: this.paginationCurrent
                }));
            },
            paginationChange: function (page) {
                let stompClient = this.$store.getters.getStompClient;
                stompClient.send('/chat/picture/search', {}, JSON.stringify({
                    content: this.$store.getters.getSearchPictureKeyword,
                    sendTime: Date.now(),
                    pageSize: this.paginationLimit,
                    pageIndex: this.paginationCurrent
                }));
            },
            send: function (pictureUrl) {
                let stompClient = this.$store.getters.getStompClient;
                stompClient.send('/chat', {}, JSON.stringify({
                    content: `picture:${pictureUrl}`,
                    sendTime: Date.now()
                }));
            }
        }
    }
</script>

<style scoped>

</style>
