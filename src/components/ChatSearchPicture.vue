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
                    class="width-size-100"
                    style="text-align: center"
                ></mu-text-field>
            </mu-col>
            <mu-col span="1">
                <mu-button class="search_btn" icon @click="search">
                    <mu-icon value="search"></mu-icon>
                </mu-button>
            </mu-col>
        </mu-row>
        <mu-row>
            <mu-grid-list class="gridlist-demo">
                <mu-col
                    v-for="(item, index) in displayedPictures"
                    :key="index"
                    span="4"
                    sm="4"
                    md="3"
                    lg="2"
                    xl="2"
                    style="position: relative"
                >
                    <img 
    :src="getPictureUrl(item)" 
    @error="handleImageError(index)" 
    :key="item.errorKey || 'img-' + index" 
    style="width: 100%" 
/>
<div 
    v-if="item.error" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background-color: rgba(255, 255, 255, 0.8);"
>
    <mu-button icon @click="reloadImage(index)">
        <mu-icon value="refresh"></mu-icon>
    </mu-button>
</div>

                    <div
                        style="position: absolute; bottom: 0; width: 100%; text-align: right; background-color: rgba(0, 0, 0, 0.75);"
                    >
                        <mu-button
                            slot="action"
                            icon
                            @click="send(getPictureUrl(item))"
                        >
                            <mu-icon value="send"></mu-icon>
                        </mu-button>
                    </div>
                </mu-col>
            </mu-grid-list>
        </mu-row>
        <mu-row>
            <mu-flex justify-content="center">
                <mu-pagination
                    :total="searchPictureCount"
                    :current.sync="paginationCurrent"
                    :page-count="5"
                    :page-size="paginationLimit"
                    @change="paginationChange"
                ></mu-pagination>
            </mu-flex>
        </mu-row>
    </mu-container>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'ChatSearchPicture',
    computed: {
        ...mapGetters({
            searchPictureKeyword: 'getSearchPictureKeyword',
            searchPictureData: 'getSearchPictureData',
            searchPictureCount: 'getSearchPictureCount',
        }),
    },
    data: () => ({
        paginationCurrent: 1,
        paginationLimit: 6,
        displayedPictures: [], // 控制显示的图片
        intervalTimer: null, // 定时器
        remainingPictures: [], // 剩余未加载的图片
    }),
    watch: {
        searchPictureData(newData) {
            this.startLoadingPictures(newData);
        },
    },
    methods: {
        updateSearchKeyword(value) {
            this.$store.commit('setSearchPictureKeyword', value);
        },
        search() {
            this.paginationCurrent = 1;
            this.sendSearchRequest();
        },
        paginationChange(page) {
            this.paginationCurrent = page;
            this.sendSearchRequest();
        },
        sendSearchRequest() {
            const stompClient = this.$store.getters.getStompClient;
            stompClient.send(
                '/chat/picture/search',
                {},
                JSON.stringify({
                    content: this.searchPictureKeyword,
                    sendTime: Date.now(),
                    pageSize: this.paginationLimit,
                    pageIndex: this.paginationCurrent,
                })
            );
        },
        send(pictureUrl) {
            const stompClient = this.$store.getters.getStompClient;
            stompClient.send(
                '/chat',
                {},
                JSON.stringify({
                    content: `picture:${pictureUrl}`,
                    sendTime: Date.now(),
                })
            );
        },
        getPictureUrl(item) {
            return `https://tx.alang.run/doutu${item.url.slice(
                item.url.lastIndexOf('/')
            )}`;
        },
        startLoadingPictures(newData) {
    // 清空当前的显示列表，避免重复
    this.displayedPictures = [];
    
    // 重置剩余图片数据
    this.remainingPictures = newData.map(item => ({ ...item, error: false, errorKey: '' }));

    // 清除可能存在的旧定时器
    if (this.intervalTimer) {
        clearInterval(this.intervalTimer);
        this.intervalTimer = null;
    }

    // 设置新的定时器加载图片
    this.intervalTimer = setInterval(() => {
        if (this.remainingPictures.length === 0) {
            clearInterval(this.intervalTimer);
            this.intervalTimer = null;
            return;
        }

        // 加载3张图片到显示列表中
        this.displayedPictures.push(
            ...this.remainingPictures.splice(0, 1)
        );
    }, 1000); // 每秒加载一次
},
          handleImageError(index) {
        // 标记图片加载失败，但不自动重试
        this.$set(this.displayedPictures[index], 'error', true);
        // this.$set(this.displayedPictures[index], 'errorKey', `error-${Date.now()}`);
    },
    reloadImage(index) {
        // 用户点击刷新按钮时重置错误状态并重新尝试加载图片
        this.$set(this.displayedPictures[index], 'error', false);

        // 更新 errorKey 以强制刷新图片
        this.$set(this.displayedPictures[index], 'errorKey', `reload-${Date.now()}`);
    },
    },
    beforeDestroy() {
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
        }
    },
};
</script>

<style scoped>
</style>
