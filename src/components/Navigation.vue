<template>
    <div>
        <mu-appbar style="width: 100%;" color="primary" z-depth="1">
            <mu-button icon slot="left" @click="isOpenDrawer=!isOpenDrawer">
                <mu-icon value="menu"></mu-icon>
            </mu-button>
            一起听歌吧（QQ群:1029454474）
        </mu-appbar>
        <mu-drawer width="300" :open.sync="isOpenDrawer" :docked="false" :right="false">
            <mu-card style="width: 100%; max-width: 375px; margin: 0 auto;">
                <mu-card-header title="JumpAlang" sub-title="Quanzhou, China">
                    <mu-avatar size="45" slot="avatar">
                        <img style="border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.2);" src="../assets/images/uicon.jpg">
                    </mu-avatar>
                </mu-card-header>
                <mu-card-media title="Smile" sub-title="Forever youthful Forever Weeping"
                               style="max-height: 200px; overflow: hidden">
                    <img src="../assets/images/fl.jpg">
                </mu-card-media>
                <mu-card-text>
                    聊天、斗图、音乐、点播、娱乐
                </mu-card-text>
            </mu-card>
            <mu-list>
                <mu-sub-header>社交</mu-sub-header>
                <mu-list-item button target="_blank" href="https://weibo.com/JumpAlang">
                    <mu-list-item-title>微博</mu-list-item-title>
                </mu-list-item>
		<mu-list-item button target="_blank" href="http://www.alang.run">
                    <mu-list-item-title>博客</mu-list-item-title>
                </mu-list-item>
		 <mu-divider></mu-divider>
                <mu-sub-header>开源</mu-sub-header>
                <mu-list-item button target="_blank" href="https://github.com/JumpAlang/Jusic-serve">
                    <mu-list-item-title>Jusic-serve</mu-list-item-title>
                </mu-list-item>
            </mu-list>
        </mu-drawer>
    </div>
</template>

<script>
    export default {
        name: "Navigation",
        data: () => ({
            isOpenDrawer: false
        })
    }
</script>

<style scoped>

</style>
