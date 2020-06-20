<template>
  <div>
    <div v-if="isPlay">
      <navigation :musichouse="musichouse" @openShareDialog="openShare = !openShare"></navigation>
      <mu-container class="demo-container">
        <mu-row style="margin-bottom: 40px;"></mu-row>
        <mu-row gutter>
          <mu-col span="12" sm="12" md="8" lg="8" xl="9">
            <mu-col span="12">
              <mu-row>
                <mu-col
                  span="12"
                  sm="12"
                  md="5"
                  lg="4"
                  xl="3"
                  style="text-align: center; padding: 0 0 40px 0;" @click="playMusic"
                >
                  <mu-avatar
                    :size="albumRotateSize"
                    style="border: 2px solid rgba(26, 26, 26, 0.5); overflow: hidden; box-shadow: inset 0 0 20px 2px #000;"
                  >
                    <img
                      :class="albumRotate ? 'album album-rotate' : 'album'"
                      :src="
                        music.pictureUrl
                          ? music.pictureUrl
                          : require('../assets/images/logo.png')
                      "
                      :style="albumRotateStyle"
                      alt="pic"
                    />
                  </mu-avatar>
                </mu-col>
                <mu-col span="12" sm="12" md="7" lg="8" xl="9">
                  <div
                    style="font-size: 24px; font-weight: 400; margin: 4px 0 10px 0; min-height: 31px;"
                  >{{ music ? music.name : "" }}</div>
                  <div style="font-size: 16px; font-weight: 400; margin: 10px 0; min-height: 21px;">
                    专辑: &nbsp;{{
                    music.album ? "《" + music.album.name + "》" : ""
                    }}
                    歌手: &nbsp;{{ music ? music.artist : "" }}
                  </div>

                  <div
                    style="font-size: 14px; font-weight: 400; margin: 50px 0 10px 0; min-height: 21px;"
                  >{{ lyric }}</div>
                  <small id="musicEndTime" style="float: right">
                    {{
                    playerTime
                    }}
                  </small>
                  <mu-linear-progress mode="determinate" :value="progress" color="#009688"></mu-linear-progress>
                  <mu-slider
                    class="demo-slider"
                    color="#009688"
                    v-model="volume"
                    style="color: rgb(0, 150, 136);"
                  ></mu-slider>
                </mu-col>
              </mu-row>
            </mu-col>
            <mu-col span="12">
              <mu-data-table
                style="background-color: transparent"
                :selectable="false"
                :hover="false"
                :columns="columns"
                :data="pick"
              >
                <template slot-scope="scope">
                  <td class="is-left">{{ scope.$index + 1 }}</td>
                  <td class="is-left">
                    <a
                      class="search_pick_btn"
                      @click="goodMusic(scope.row)"
                      v-if="scope.$index != 0 && good"
                    >点赞</a>
                    {{
                    isRoot || isAdmin
                    ? scope.row.name + `[${scope.row.id}]`
                    : scope.row.name
                    }}
                  </td>
                  <td class="is-center">{{ scope.row.artist }}</td>
                  <td class="is-center">{{ "《" + scope.row.album.name + "》" }}</td>
                  <!--                                    <td class="is-center">{{scope.row.nickName + scope.row.sessionId?`[${scope.row.sessionId}]`: '[]'}}</td>-->

                  <td class="is-center">
                    {{
                    isRoot || isAdmin
                    ? scope.row.nickName +
                    (scope.row.sessionId
                    ? `[${scope.row.sessionId}]`
                    : "")
                    : scope.row.nickName
                    }}
                  </td>
                </template>
              </mu-data-table>
            </mu-col>
          </mu-col>
          <mu-col span="12" sm="12" md="4" lg="4" xl="3">
            <mu-col
              :style="
                screenWidth < 766 && screenWidth !== 0
                  ? 'margin: 100px 0 0 0;'
                  : ''
              "
            >
              <div
                style="font-size: 24px; font-weight: 400; margin: 4px 0 10px 0; min-height: 31px;"
              >
                实时聊天
                <mu-chip color="green" @click="openHouse = !openHouse">房间</mu-chip>
              </div>
              <div style="font-size: 16px; font-weight: 400;">
                在线人数: {{ online }}
                <span style="float:right;cursor:pointer;color:gray;" @click="clearScr">清屏</span>
              </div>
              <div id="chat-container">
                <div
                  v-for="(item, index) in chatData"
                  :style="item.type === 'notice' ? 'text-align: center' : ''"
                  style="padding: 10px 0"
                >
                  <div>
                    <small class="chat-data-user">
                      {{
                      (isRoot || isAdmin) && item.type === "chat"
                      ? item.nickName + `[${item.sessionId}]`
                      : item.nickName
                      }}
                    </small>
                  </div>
                  <div v-if="item.type === 'notice'">
                    <span class="chat-data-notice">{{ item.content }}</span>
                  </div>
                  <div v-if="item.type === 'chat'" class="chat-data-content">
                    <span>{{ item.content }}</span>
                    <img
                      v-if="item.images.length > 0"
                      v-for="(img, index) in item.images"
                      :src="img"
                      alt
                      style="width: 100%; display: block"
                    />
                  </div>
                </div>
              </div>
              <div
                :class="
                  screenWidth < 766 && screenWidth !== 0
                    ? 'message-input-group'
                    : ''
                "
              >
                <mu-text-field
                  :value="chatMessage"
                  @input="updateChatMessage"
                  @keydown.enter="sendHandler"
                  placeholder="Message..."
                  color="primary"
                  class="width-size-100 chat-message"
                ></mu-text-field>
                <br />
                <div style="color:white;">
                  <mu-radio :value="'wy'" v-model="sourceChat" color="primary" :label="'网易'"></mu-radio>
                  <mu-radio :value="'qq'" v-model="sourceChat" color="primary" :label="'QQ'"></mu-radio>
                  <mu-radio :value="'mg'" v-model="sourceChat" color="primary" :label="'咪咕'"></mu-radio>
                </div>

                <mu-button
                  v-if="!isContented"
                  @click="connect"
                  color="primary"
                  style="width: 100%"
                >连接服务器</mu-button>
                <mu-button
                  v-if="isContented"
                  @click="sendHandler"
                  color="primary"
                  style="width: 100%"
                >发送消息</mu-button>
                  <div style="padding-top: 10px;">
               
                  <mu-chip style="margin-right:10px;"
                    color="rgba(0, 150, 136, 0.5)"
                    @click="openPictureSearch = !openPictureSearch"
                  >图片</mu-chip>
                  <mu-chip style="margin-right:10px;"  color="rgba(0, 150, 136, 0.5)" @click="musicSkipVote">切歌</mu-chip>
                  <mu-chip style="margin-right:10px;" color="rgba(0, 150, 136, 0.5)" @click="openSearch = !openSearch">歌曲</mu-chip>
                  <mu-chip style="margin-right:10px;"  color="rgba(0, 150, 136, 0.5)" @click="openSearchGd = !openSearchGd">歌单</mu-chip>
             
             </div>
              </div>
            
            </mu-col>
            <mu-col style="margin-bottom: 160px; ">
              <div style="padding: 10px 0">
                <mu-divider></mu-divider>
               
                <p>交流QQ群:1029454474,欢迎过来唠嗑。</p>
                <p>
                  提示：输入 “
                  <span style="color: #009688;">点歌 歌名</span>”
                  即可点歌。
                </p>
                <p>
                  例如：
                  <span style="color: #009688;">点歌 春夏秋冬</span>
                </p>
                <p>支持输入网易云音乐 ID 点歌</p>
                <p>
                  没有想要点的音乐？ 快试一试 “
                  <span
                    @click="openSearch = !openSearch"
                    style="cursor: pointer; color: #009688;"
                  >[歌曲]</span>“，如果知道歌单id，还可以在歌曲窗口直接加*搜索： <span style="color: #009688;">*歌单id</span><br/>不知道歌单id?或许歌单搜索你用得到：
                  <span
                    @click="openSearchGd = !openSearchGd"
                    style="cursor: pointer; color: #009688;"
                  >[歌单]</span>提示：歌单页面可以搜索网易歌单、网易用户id的歌单、qq歌单、qq用户id的歌单
                </p>
                <br />
                <p>
                  如点错歌曲可以输入 “
                  <span style="color: #009688;">删除音乐 歌名</span>” 即可删除歌曲，管理员可以使用歌曲id删除。
                </p>
                <br />
                <p>
                  如遇不好听的歌可以输入 “
                  <span style="color: #009688;">投票切歌</span>” 或者点击 “
                  <span @click="musicSkipVote" style="cursor: pointer; color: #009688;">[切歌]</span>”，当投票人数大于在线人数 30% 时将会切歌。
                </p>
                <br />
                <p>
                  输入 “
                  <span style="color: #009688;">设置昵称 名字</span>”
                  可以设置自己的显示昵称，仅限当前客户端有效。
                </p>
                <p>
                  想要斗图？ ┏ (゜ω゜)=☞ “
                  <span
                    @click="openPictureSearch = !openPictureSearch"
                    style="cursor: pointer; color: #009688;"
                  >[图片]</span>”
                </p>
                <br/>
                 <p>
                  倒计时退出房间
                   输入 “
                  <span style="color: #009688;">倒计时退出 1</span>”
                  则将在1分钟后退出房间。取消倒计时退出：<span style="color: #009688;">取消退出</span>”

                </p>
                <br/>
                 <p>
                  如果有什么好的想法、建议或问题可以单项向管理员发送消息，（＾∀＾●）ﾉｼ
                  “
                  <span style="color: #009688;">@管理员 内容</span>”,
                  空格隔开哦!
                </p>
                <p>另外也可以在项目仓库开个 issue 进行公开讨论</p>
                <br />
                <p>
                  <span style="color: orange;">管理员功能</span>
                </p>
                <p>
                  1.登录： “
                  <span style="color: #009688;">admin 123456</span>” 。<br/><br/>
                  2.修改密码： “
                  <span style="color: #009688;">修改密码 123456</span>” 。<br/><br/>
                  3.点赞模式（歌曲列表按点赞数排序）： “
                  <span style="color: #009688;">点赞模式</span>” 退出则“
                  <span style="color: #009688;">退出点赞模式</span>” 。<br/><br/>
                  4.修改投票切歌率： “
                  <span style="color: #009688;">投票切歌率 1</span>” 数值在(0,1]。<br/><br/>
                  5.禁止切歌：“
                  <span style="color: #009688;">禁止切歌</span>” 启用则“
                  <span style="color: #009688;">启用切歌</span>” 。<br/><br/>
                  6.禁止点歌：“
                  <span style="color: #009688;">禁止点歌</span>” 启用则“
                  <span style="color: #009688;">启用点歌</span>” 。<br/><br/>
                  7.清空列表：“
                  <span style="color: #009688;">清空列表</span>” 。<br/><br/>
                  8.清空默认播放列表：“
                  <span style="color: #009688;">清空默认列表</span>” 。<br/><br/>
                  9.设置默认播放列表：“
                  <span style="color: #009688;">设置默认列表 24381616,1</span>” 。<br/><br/>
                  10.默认列表歌曲数：“
                  <span style="color: #009688;">默认列表歌曲数</span>” 。<br/><br/>
                  11.置顶音乐： “
                  <span style="color: #009688;">置顶音乐 音乐id</span>” 音乐id即歌曲列表中歌曲后面那一串字母，如411214279。<br/><br/>
                  12.拉黑音乐：“
                  <span style="color: #009688;">拉黑音乐 音乐id</span>” 漂白则“
                  <span style="color: #009688;">漂白音乐 音乐id</span>” 。<br/><br/>
                  13.音乐黑名单： “
                  <span style="color: #009688;">音乐黑名单</span>” 。<br/><br/>
                  14.拉黑用户：“
                  <span style="color: #009688;">拉黑用户 用户id</span>” 漂白则“
                  <span style="color: #009688;">漂白用户 用户id</span>” 用户id即用户ip后面那一串字母，如ju2etxv2。<br/><br/>
                  15.用户黑名单： “
                  <span style="color: #009688;">用户黑名单</span>” 。<br/><br/>
                  16.设置点歌人：“
                  <span style="color: #009688;">设置点歌人 用户id</span>” 用户id即用户ip后面那一串字母，如ju2etxv2。取消则“
                  <span style="color: #009688;">取消点歌人 用户id</span>” 。<br/><br/>
                  17.设置切歌人：“
                  <span style="color: #009688;">设置切歌人 用户id</span>” 用户id即用户ip后面那一串字母，如ju2etxv2。取消则“
                  <span style="color: #009688;">取消切歌人 用户id</span>” 。<br/><br/>
                </p>
                <br />
               
              </div>
            </mu-col>
          </mu-col>
        </mu-row>
      </mu-container>
      <div id="blur" style="opacity: 0.4">
        <img :src="music.pictureUrl" alt="blur-img" />
      </div>
      <div>
        <audio
          id="music"
          :src="music.url"
          @timeupdate="musicTimeUpdate"
          controls
          autoplay="autoplay"
          @canplaythrough="nextSong"
          @canplay="setCurrentTime"
          style="display: none"
        ></audio>
        <audio id="music2" :src="music2.url" style="display: none"></audio>
      </div>
    </div>
    <div id="play" v-if="!isPlay" :style="backgroundDiv" >
    <mu-flex class="flex-wrapper" justify-content="end" style="margin-top:10px;">
      <mu-button color="info" flat @click="linkDownload('http://www.alang.run/release')">
       <mu-icon left value="android"></mu-icon>
          APP</mu-button>
    </mu-flex>
    <mu-flex class="flex-wrapper" justify-content="center" style="margin-top:10px;" wrap="wrap">
      <mu-flex  v-for="house, index in homeHouses" :key="house.id" @click="enterHomeHouse(house.id,house.name,house.needPwd)">
          <mu-tooltip  :content="house.desc">
            <mu-chip class="demo-chip" color="teal" style="margin:5px 3px;">
              <mu-avatar :size="32" color="blue300">
                <mu-icon :value="house.needPwd?'lock':'lock_open'"></mu-icon>
              </mu-avatar>
              {{house.name}}
            </mu-chip>
          </mu-tooltip>
      </mu-flex>
        
    </mu-flex>

      <mu-flex class="flex-wrapper" justify-content="center" style="padding-top:30px;">
       <mu-form :model="homeHouse" class="mu-demo-form" align="center" >
         <div align="center">
            <mu-text-field v-model="homeHouse.name" placeholder="房间名称"></mu-text-field>
          <mu-text-field v-model="homeHouse.desc" placeholder="房间描述"></mu-text-field>
          <mu-text-field
          v-if="homeHouse.needPwd"
          placeholder="房间密码"
          v-model="homeHouse.password"
          :action-icon="visibility ? 'visibility_off' : 'visibility'"
          :action-click="() => (visibility = !visibility)"
          :type="visibility ? 'text' : 'password'"
          ></mu-text-field>
         </div>
        <mu-flex class="flex-wrapper" align-items="center">
          <mu-flex class="flex-demo" justify-content="end" fill><mu-button color="primary" @click="createHomeHouse">创建房间</mu-button></mu-flex>
          <mu-flex class="flex-demo" justify-content="start" fill> <mu-switch v-model="homeHouse.needPwd" color="primary" label="房间密码"></mu-switch></mu-flex>     
        </mu-flex>
      </mu-form>
      </mu-flex>
      <mu-dialog id="sharereach"  width="100%"
      transition="slide-bottom"
      fullscreen :open.sync="openShareReach">
       <mu-appbar color="primary" :title="houseReachName">
        <mu-button slot="right" flat @click="openShareReach = !openShareReach">X</mu-button>
      </mu-appbar>
       <mu-icon @click="reachHouse" value="play_circle_filled" color="primary" size="150"
                     style="position: fixed; top: calc(50% - 75px); left: calc(50% - 75px); cursor: pointer;"></mu-icon>
    </mu-dialog>
    </div>
    <mu-dialog id="search" width="100%"
      transition="slide-bottom"
      fullscreen  :open.sync="openSearch">
      <mu-appbar color="primary" title="歌曲搜索">
        <mu-button slot="right" flat @click="openGd">歌单</mu-button>
        <mu-button slot="right" flat @click="closeGq">X</mu-button>
      </mu-appbar>
      <mu-container style="width:100%;">
        <mu-row>
          <mu-col>
            <mu-text-field
              :value="searchKeyword"
              @input="updateSearchKeyword"
              @keydown.enter="search"
              :placeholder="placeHolderGq"
              color="#009688"
              class="width-size-100"
              style="text-align: center"
            ></mu-text-field>
            <mu-radio
              :value="'wy'"
              v-model="source"
              color="primary"
              :label="'网易'"
              class="searchradio"
            ></mu-radio>
            <mu-radio
              :value="'qq'"
              v-model="source"
              color="primary"
              :label="'QQ'"
              class="searchradio"
            ></mu-radio>
            <mu-radio
              :value="'mg'"
              v-model="source"
              color="primary"
              :label="'咪咕'"
              class="searchradio"
            ></mu-radio>
            <mu-radio
              :value="'lz'"
              v-model="source"
              color="primary"
              :label="'禁歌'"
              class="searchradio"
            ></mu-radio>
          </mu-col>
          <mu-col span="1">
            <mu-button class="search_btn" icon @click="search">
              <mu-icon value="search"></mu-icon>
            </mu-button>
          </mu-col>
        </mu-row>
        <mu-row>
          <mu-data-table
            style="background-color: transparent"
            :selectable="false"
            :hover="false"
            :columns="searchColumns"
            :data="searchData"
          >
            <template slot-scope="scope">
              <td class="is-left">{{ scope.$index + 1 }}</td>
              <!--<td class="is-center">-->
              <!--<a v-if="showPickButton(scope.row.privilege)" class="search_pick_btn" @click="pickMusic(scope.row)">点歌</a>-->
              <!--<mu-tooltip v-if="!showPickButton(scope.row.privilege)" content="当前音乐不能点播">-->
              <!--<a v-if="" class="search_pick_btn_disable">点歌</a>-->
              <!--</mu-tooltip>-->
              <!--</td>-->
              <td class="is-left">
                <a v-if="showPickButton(scope.row.privilege)" @click="pickMusic(scope.row)">
                  <mu-avatar size="20" slot="avatar">
                    <img src="../assets/images/play.png" />
                  </mu-avatar>
                </a>
                <mu-avatar size="20" slot="avatar" v-if="!showPickButton(scope.row.privilege)">
                  <mu-tooltip content="当前音乐不能点播">
                    <img src="../assets/images/noplay.png" />
                  </mu-tooltip>
                </mu-avatar>
                {{ scope.row.name }}
              </td>
              <td class="is-center">{{ scope.row.artist }}</td>
           <!--    <td  class="is-center">
                 <mu-card-media width="50px" heigth="50px">
                    <img :src="scope.row.picture_url">
                </mu-card-media>
              </td>-->
              <td class="is-center">{{ "《" + scope.row.album.name + "》" }}</td>
              <td class="is-center">{{ formatterTime(scope.row.duration / 1000) }}</td>
            </template>
          </mu-data-table>
        </mu-row>
        <mu-row>
          <mu-flex justify-content="center">
            <mu-pagination
              :total="searchCount"
              :current.sync="current"
              :page-count="pageCount"
              :page-size="limit"
              @change="paginationChange"
            ></mu-pagination>
          </mu-flex>
        </mu-row>
      </mu-container>
    </mu-dialog>
     <mu-dialog id="searchGd"  width="100%"
      transition="slide-bottom"
      fullscreen :open.sync="openSearchGd">
       <mu-appbar color="primary" title="歌单搜索">
        <mu-button slot="right" flat @click="openUser">用户</mu-button>
        <mu-button slot="right" flat @click="openGq">歌曲</mu-button>
        <mu-button slot="right" flat @click="closeGd">X</mu-button>
      </mu-appbar>
      <mu-container style="width:100%;">
        <mu-row>
          <mu-col >
            <mu-text-field
              :value="searchKeywordGd"
              @input="updateSearchKeywordGd"
              @keydown.enter="searchGd"
              :placeholder="placeHolderGd"
              color="#009688"
              class="width-size-100"
              style="text-align: center"
            ></mu-text-field>
                <mu-radio
              :value="'wy'"
              v-model="sourceGd"
              color="primary"
              :label="'网易'"
              class="searchradio2"
            ></mu-radio>
              <mu-radio
              :value="'wy_user'"
              v-model="sourceGd"
              color="primary"
              :label="'用户'"
              class="searchradio2"
            ></mu-radio>
            <mu-radio
              :value="'qq'"
              v-model="sourceGd"
              color="primary"
              :label="'QQ'"
              class="searchradio"
            ></mu-radio>
            <mu-radio
              :value="'qq_user'"
              v-model="sourceGd"
              color="primary"
              :label="'用户'"
              class="searchradio"
            ></mu-radio>
          </mu-col>
          <mu-col span="1">
            <mu-button class="search_btn" icon @click="searchGd">
              <mu-icon value="search"></mu-icon>
            </mu-button>
          </mu-col>
        </mu-row>
        <mu-row>
          <mu-data-table
            style="background-color: transparent"
            :selectable="false"
            :hover="false"
            :columns="searchColumnsGd"
            :data="searchDataGd"
          >
            <template slot-scope="scope2">
              <!--<td class="is-center">-->
              <!--<a v-if="showPickButton(scope.row.privilege)" class="search_pick_btn" @click="pickMusic(scope.row)">点歌</a>-->
              <!--<mu-tooltip v-if="!showPickButton(scope.row.privilege)" content="当前音乐不能点播">-->
              <!--<a v-if="" class="search_pick_btn_disable">点歌</a>-->
              <!--</mu-tooltip>-->
              <!--</td>-->
              <td class="is-left">
                {{ scope2.$index + 1 }}.
                <a  @click="songlistDetail(scope2.row)">
                <mu-icon :value="'reply'"></mu-icon>
                </a>
                {{ scope2.row.name }}
              </td>
              <td>
                <mu-card-media width="50px" heigth="50px">
                    <img :src="scope2.row.pictureUrl">
                </mu-card-media>
              </td>
              <td class="is-center">{{ scope2.row.desc|ellipsis }}</td>

              <td class="is-center">{{ scope2.row.creator }}</td>
              <td class="is-center">{{ scope2.row.creatorUid }}</td>
              <td class="is-center">{{ scope2.row.id }}</td>
               <td class="is-center">{{ scope2.row.playCount }}</td>
               <td class="is-center">{{ scope2.row.songCount }}</td>
            </template>
          </mu-data-table>
        </mu-row>
        <mu-row>
          <mu-flex justify-content="center">
            <mu-pagination
              :total="searchCountGd"
              :current.sync="currentGd"
              :page-count="pageCount"
              :page-size="limit"
              @change="paginationChangeGd"
            ></mu-pagination>
          </mu-flex>
        </mu-row>
      </mu-container>
    </mu-dialog>
    <mu-dialog id="searchUser"  width="100%"
      transition="slide-bottom"
      fullscreen :open.sync="openSearchUser">
       <mu-appbar color="primary" title="用户搜索">
        <mu-button slot="right" flat @click="openGdFromUser">歌单</mu-button>
        <mu-button slot="right" flat @click="closeUser">X</mu-button>
      </mu-appbar>
      <mu-container style="width:100%;">
        <mu-row>
          <mu-col >
            <mu-text-field
              :value="searchKeywordUser"
              @input="updateSearchKeywordUser"
              @keydown.enter="searchUser"
              placeholder="请输入用户昵称"
              color="#009688"
              class="width-size-100"
              style="text-align: center"
            ></mu-text-field>
            <mu-radio
              :value="'wy'"
              v-model="sourceUser"
              color="primary"
              :label="'网易'"
              class="searchradio"
            ></mu-radio>
          </mu-col>
          <mu-col span="1">
            <mu-button class="search_btn" icon @click="searchUser">
              <mu-icon value="search"></mu-icon>
            </mu-button>
          </mu-col>
        </mu-row>
        <mu-row>
          <mu-data-table
            style="background-color: transparent"
            :selectable="false"
            :hover="false"
            :columns="searchColumnsUser"
            :data="searchDataUser"
          >
            <template slot-scope="scope3">
              <!--<td class="is-center">-->
              <!--<a v-if="showPickButton(scope.row.privilege)" class="search_pick_btn" @click="pickMusic(scope.row)">点歌</a>-->
              <!--<mu-tooltip v-if="!showPickButton(scope.row.privilege)" content="当前音乐不能点播">-->
              <!--<a v-if="" class="search_pick_btn_disable">点歌</a>-->
              <!--</mu-tooltip>-->
              <!--</td>-->
              <td class="is-left">
                {{ scope3.$index + 1 }}.
                <a  @click="songtableDetail(scope3.row)">
                <mu-icon :value="'reply'"></mu-icon>
                </a>
                {{ scope3.row.nickname }}
              </td>
              <td class="is-center">
                <mu-avatar size="36">
                <img :src="scope3.row.avatarUrl">
              </mu-avatar>
              </td>
              <td class="is-center">{{ scope3.row.userId }}</td>

              <td class="is-center">{{ scope3.row.signature |ellipsis }}</td>
              <td class="is-center">{{ scope3.row.description|ellipsis}}</td>
              <td class="is-center">{{ scope3.row.gender==1?'男':(scope3.row.gender==2?'女':'未知' )}}</td>

            </template>
          </mu-data-table>
        </mu-row>
        <mu-row>
          <mu-flex justify-content="center">
            <mu-pagination
              :total="searchCountUser"
              :current.sync="currentUser"
              :page-count="pageCount"
              :page-size="limit"
              @change="paginationChangeUser"
            ></mu-pagination>
          </mu-flex>
        </mu-row>
      </mu-container>
    </mu-dialog>
     <mu-dialog id="share"  width="100%"
      transition="slide-bottom"
      fullscreen :open.sync="openShare">
       <mu-appbar color="primary" title="分享">
        <mu-button slot="right" flat @click="openShare = !openShare">X</mu-button>
      </mu-appbar>
        <mu-flex class="flex-wrapper" justify-content="center">
          <mu-card style="max-width: 375px;margin-top: 20px;"  align="center">
          <mu-card-header :title="musichouse" :sub-title="homeDesc?(homeDesc):'做一个自带背景音乐的人'" align="left">
          <mu-avatar slot="avatar" size="50">
              <img src="../assets/images/logo.png">
          </mu-avatar>
          </mu-card-header>
          <mu-card-media>
          <qrcode-vue
	          id="qrcodeBox"
            level="H"
	          :size="qrcodeVue.size"
	          :value="qrcodeVue.value"
	          :background="qrcodeVue.bgColor"
	          :foreground="qrcodeVue.fgColor">
         </qrcode-vue>
        </mu-card-media>
       <mu-card-title title="分享链接" :sub-title="qrcodeVue.value"></mu-card-title>
      </mu-card>
    </mu-flex>
    </mu-dialog>
    <mu-dialog id="search-picture" width="auto" :open.sync="openPictureSearch">
      <chat-search-picture></chat-search-picture>
    </mu-dialog>
    <mu-dialog
      id="house_dialog"
      width="100%"
      transition="slide-bottom"
      fullscreen
      :open.sync="openHouse">
      <mu-appbar color="primary" title="房间">
        <mu-button slot="right" flat @click="closeHouse">X</mu-button>
      </mu-appbar>
        <mu-flex class="flex-wrapper" justify-content="center">
            <mu-form :model="house" class="mu-demo-form" align="center">
             <div align="center">
              <mu-text-field v-model="house.name" placeholder="房间名称"></mu-text-field>
              <mu-text-field v-model="house.desc" placeholder="房间描述"></mu-text-field>
              <mu-text-field v-if="house.needPwd" placeholder="房间密码" v-model="house.password" :action-icon="visibility ? 'visibility_off' : 'visibility'"
                :action-click="() => (visibility = !visibility)"
                :type="visibility ? 'text' : 'password'"
              ></mu-text-field>
              </div>

              <mu-flex class="flex-wrapper" align-items="center">
                <mu-flex class="flex-demo" justify-content="end" fill><mu-button color="primary" @click="createHouse">创建房间</mu-button></mu-flex>
                <mu-flex class="flex-demo" justify-content="start" fill> <mu-switch v-model="house.needPwd" color="primary" label="房间密码"></mu-switch></mu-flex>     
              </mu-flex>
            </mu-form>
        </mu-flex>
      <mu-flex class="flex-wrapper" justify-content="center" style="padding-top:30px;" wrap="wrap"	>
        <mu-flex   v-for="houseItem, index in houses"
          :key="houseItem.id"
          @click="enterHouse(houseItem.id,houseItem.name,houseItem.needPwd)" >
           <mu-tooltip :content="houseItem.desc">
            <mu-chip class="demo-chip" color="teal" style="margin:5px 3px;">
              <mu-avatar :size="32" color="blue300">
                <mu-icon :value="houseItem.needPwd?'lock':'lock_open'"></mu-icon>
              </mu-avatar>
              {{houseItem.name}}
            </mu-chip>
          </mu-tooltip>
        </mu-flex>
         
      </mu-flex>
    </mu-dialog>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { sendUtils, messageUtils, timeUtils, musicUtils } from "../utils";
import { baseUrl, isProduction } from "../config/environment";
import Navigation from "../components/Navigation";
import ChatSearchPicture from "../components/ChatSearchPicture";
import wx from 'weixin-js-sdk';
import QrcodeVue from "qrcode.vue";
export default {
  name: "Music",
  components: {
    Navigation,
    ChatSearchPicture,
    QrcodeVue
  },
  filters: {
    ellipsis (value) {
      if (!value) return ''
      if (value.length > 20) {
        return value.slice(0,20) + '...'
      }
      return value
    }
  },
  computed: {
    ...mapGetters({
      isContented: "getIsConnected",
      online: "getSocketOnline",
      chatMessage: "getChatMessage",
      chatData: "getChatData",
      music: "getPlayerMusic",
      progress: "getPlayerProgress",
      playerTime: "getPlayerTime",
      // volume: 'getPlayerVolume',
      pick: "getPlayerPick",
      lyric: "getPlayerLyric",
      isRoot: "isSocketRoot",
      isAdmin: "isSocketAdmin",
      good: "isSocketGood",
      searchKeyword: "getSearchKeyword",
      searchKeywordGd: "getSearchKeywordGd",
      searchKeywordUser: "getSearchKeywordUser",
      searchData: "getSearchData",
      searchDataGd: "getSearchDataGd",
      searchDataUser: "getSearchDataUser",
      searchCount: "getSearchCount",
      searchCountGd: "getSearchCountGd",
      searchCountUser: "getSearchCountUser",
      music2: "getMusic2"
    }),
    ...mapMutations({
      // volume: 'setPlayerVolume'
    }),
    volume: {
      get: function() {
        return this.$store.getters.getPlayerVolume;
      },
      set: function(value) {
        music.volume = Number(value) / 100;
        this.$store.commit("setPlayerVolume", value);
      }
    }
  },
  data: () => ({
    isPlay: false,
    columns: [
      { title: "ID", name: "id", width: 80, align: "left" },
      { title: "歌曲", name: "name", width: 200, align: "left" },
      { title: "歌手", name: "calories", align: "center" },
      { title: "专辑", name: "fat", align: "center" },
      { title: "点歌人", name: "carbs", align: "center" }
    ],
    albumRotate: false,
    screenWidth: document.documentElement.clientWidth,
    albumRotateSize: 300,
    albumRotateStyle: "",
    openSearch: false,
    openSearchGd: false,
    openSearchUser: false,
    openHouse: false,
    searchColumns: [
      { title: "ID", name: "id", width: 40, align: "left" },
      // {title: '操作', name: 'op', align: 'center'},
      { title: "歌曲", name: "name", width: 200, align: "left" },
      { title: "歌手", name: "artist", align: "center" },
    //  { title: "封面", name: "picture_url", align: "center" },
      { title: "专辑", name: "album", align: "center" },
      { title: "时长", name: "duration", align: "center" }
    ],
     searchColumnsGd: [
      // {title: '操作', name: 'op', align: 'center'},
      { title: "歌单", name: "name", width: 200, align: "left" },
      { title: "封面", name: "pictureUrl", align: "center" },
      { title: "描述", name: "desc", align: "center" },
      { title: "创建者", name: "creator", align: "center" },
      { title: "创建者id", name: "creatorUid", align: "center" },
      { title: "歌单id", name: "id", align: "center" },
      { title: "播放量", name: "playCount", align: "center" },
      { title: "曲数", name: "songCount", align: "center" }
    ],
     searchColumnsUser: [
      // {title: '操作', name: 'op', align: 'center'},
      { title: "昵称", name: "nickname", width: 200, align: "left" },
      { title: "头像", name: "avatarUrl", align: "center" },
      { title: "用户id", name: "userId", align: "center" },
      { title: "签名", name: "signature", align: "center" },
      { title: "描述", name: "description", align: "center" },
      { title: "性别", name: "gender", align: "center" }
    ],
    keyword: "",
    current: 1,
    currentGd: 1,
    currentUser:1,
    limit: 10,
    pageCount: 7,
    openPictureSearch: false,
    source: "wy",
    sourceGd: "wy",
    sourceChat: "wy",
    sourceUser: "wy",
    house: { name: "", desc: "", password: "", needPwd: false },
    homeHouse: { name: "", desc: "", password: "", needPwd: false },
    secondUrl: "",
    firstLoaded: 0,
    houses: [],
    homeHouses: [],
    musichouse: "一起听歌吧",
    loading: {},
    houseForward: "",
    visibility: false,
    playingId:"",
    houseId:"",
    housePwd:"123",
    connectType:"",
    houseIdNoAction:"",
    housePwdNoAction:"123",
    connectTypeNoAction:"",
    placeHolderGd:'试下为空搜索下(*^__^*)',
    placeHolderGq:'请输入关键字搜索',
     backgroundDiv:{
       position:"fixed",
       top:0,
       left: 0,
        width:"100%",
        height:"100%",
        zoom: 1,
        background:'url(' + require('../assets/images/background.jpg') + ') no-repeat',
        "background-size":"100% 100%",
         "background-size": "cover",
         "-webkit-background-size": "cover",
        "-o-background-size": "cover"
    },
     qrcodeVue: {
        size: 250,
        bgColor: "#fff",
        fgColor: "#000",
        value: ""	//二维码地址
      },
      openShare:false,
      openShareReach:false,
      houseReachId:'',
      houseReachName:'直达房间',
      homeDesc:'',
      closeClock:null
   } ),
  methods: {
    play: function() {
      this.getScreenWidth();
      this.isPlay = !this.isPlay;
      this.connect();
    },
    connect: function() {
      let _this = this;
      let socketClient = this.$store.getters.getSocketClient;
      let stompClient = this.$store.getters.getStompClient;

      socketClient =new SockJS(baseUrl + "/server?houseId="+this.houseId+"&housePwd="+this.housePwd+"&connectType="+this.connectType); // new SockJS("https://www.alang.run" + "/wss?houseId="+this.houseId+"&housePwd="+this.housePwd+"&connectType="+this.connectType);// 
      stompClient = Stomp.over(socketClient);

      if (isProduction) {
        stompClient.debug = () => {};
      }
      stompClient.connect(
        {},
        frame => {
          // console.log('连接到服务器成功！', frame);
          this.$store.commit("setSocketIsConnected", true);
          // pre onmessage
          let afterOnMessage = socketClient.onmessage;
          socketClient.onmessage = function(message) {
            _this.messageHandler(message);
            afterOnMessage(message);
          };

          // pre onclose
          let afterOnclose = socketClient.onclose;
          socketClient.onclose = function(e) {
            if (e.type === "close") {
              _this.$store.commit("setSocketIsConnected", false);
              _this.$store.commit("pushChatData", {
                type: "notice",
                content: "网络异常, 请尝试重新连接服务器!"
              });
              _this.$toast.error("网络异常, 请尝试重新连接服务器!");
            }
            afterOnclose(e);
          };

          let userName = window.localStorage.getItem("USER_NAME");
          if (userName) {
            this.settingName(userName);
          }

          this.subscribe();
        },
        error => {
          // console.log('连接到服务器失败！', error);
        }
      );

      this.saveSocket(socketClient, stompClient);
    },
    close: function() {
      let socketClient = this.$store.getters.getSocketClient;
      let stompClient = this.$store.getters.getStompClient;

      stompClient.disconnect();
      socketClient.close();
      this.isPlay = false;
      this.playingId = "";

      this.saveSocket(socketClient, stompClient);
    },
    subscribe: function() {
      let stompClient = this.$store.getters.getStompClient;

      stompClient.subscribe("/topic/chat", response => {
        let body = JSON.parse(response.body);
        if (body.code == "20000") {
          this.$toast.message(body.data);
        }
        //this.$store.commit("pushChatData", .data);
      });

      stompClient.subscribe("/topic/music/order", response => {
        // console.log('来自 /topic/music/order 频道的消息', response);
      });

      this.saveSocket(null, stompClient);
    },
    saveSocket: function(socketClient, stompClient) {
      if (socketClient !== null) {
        this.$store.commit("setSocketClient", socketClient);
      }
      if (stompClient !== null) {
        this.$store.commit("setStompClient", stompClient);
      }
    },
    sendHandler: function() {
      // console.log('消息发送处理器');
      let stompClient = this.$store.getters.getStompClient;
      let chatMessage = this.$store.getters.getChatMessage;

      let instruction = sendUtils.parseInstruction(chatMessage);
      let content = "";

      switch (instruction) {
        case "点歌":
          content = sendUtils.parseContent(instruction, chatMessage);
          if (content === "") {
            // console.log('请输入音乐关键词', chatMessage)
          } else {
            stompClient.send(
              "/music/pick",
              {},
              JSON.stringify({
                name: content,
                source: this.sourceChat,
                sendTime: Date.now()
              })
            );
          }
          break;
        case "投票切歌":
          this.musicSkipVote();
          break;
        case "设置昵称":
          content = sendUtils.parseContent(instruction, chatMessage);
          if (content === "") {
            // console.log('请输入昵称', chatMessage)
          } else {
            this.settingName(content);
          }
          break;
        case "公告":
          content = sendUtils.parseContent(instruction, chatMessage);
          if (content === "") {
            // console.log('请输入公告', chatMessage)
          } else {
            stompClient.send("/chat/notice/" + content, {}, JSON.stringify({}));
          }
          break;
        case "root":
          content = sendUtils.parseContent(instruction, chatMessage);
          if (content === "") {
            // console.log('请输入 root 密码', chatMessage)
          } else {
            stompClient.send(
              "/auth/root",
              {},
              JSON.stringify({
                password: content,
                sendTime: Date.now()
              })
            );
          }
          break;
        case "admin":
          content = sendUtils.parseContent(instruction, chatMessage);
          if (content === "") {
            // console.log('请输入 admin 密码', chatMessage)
          } else {
            stompClient.send(
              "/auth/admin",
              {},
              JSON.stringify({
                password: content,
                sendTime: Date.now()
              })
            );
          }
          break;
        case "置顶音乐":
          content = sendUtils.parseContent(instruction, chatMessage);
          if (content === "") {
            // console.log('请输入要置顶的音乐 id', chatMessage)
          } else {
            stompClient.send(
              "/music/top",
              {},
              JSON.stringify({
                id: content,
                sendTime: Date.now()
              })
            );
          }
          break;
        case "删除音乐":
          content = sendUtils.parseContent(instruction, chatMessage);
          if (content === "") {
            // console.log('请输入要删除的音乐 id', chatMessage)
          } else {
            stompClient.send(
              "/music/delete",
              {},
              JSON.stringify({
                id: content,
                sendTime: Date.now()
              })
            );
          }
          break;
              case "设置默认列表":
          content = sendUtils.parseContent(instruction, chatMessage);
          if (content === "") {
            // console.log('请输入要删除的音乐 id', chatMessage)
          } else {
            stompClient.send(
              "/music/setDefaultPlaylist",
              {},
              JSON.stringify({
                id: content,
                source: this.sourceChat
              })
            );
          }
          break;
        case "清空列表":
          stompClient.send("/music/clear", {}, "");
          break;
        case "清空默认列表":
          stompClient.send("/music/clearDefaultPlayList", {}, "");
          break;
        case "音乐黑名单":
          stompClient.send("/music/blackmusic", {}, "");
          break;
         case "默认列表歌曲数":
          stompClient.send("/music/playlistSize", {}, "");
          break;
        case "用户黑名单":
          stompClient.send("/chat/blackuser", {}, "");
          break;
        case "调整音量":
          content = sendUtils.parseContent(instruction, chatMessage);
          if (content === "") {
            content = 0;
          }

          stompClient.send("/music/volumn/" + content, {}, "");

          break;
         case "倒计时退出":
          content = sendUtils.parseContent(instruction, chatMessage);
          if(!/^\d+$/.test(content)){
            this.$toast.message("请输入要在几分钟后退出");
          }else{
            this.setTimeToClose(content);
            this.$toast.message("设置成功，将在"+content+"分钟后退出");
          }
          break;
        case "取消退出":         
          this.setTimeToClose(0);
          this.$toast.message("取消成功");
          break;
        case "修改密码":
          content = sendUtils.parseContent(instruction, chatMessage);

          stompClient.send("/auth/adminpwd/" + content, {}, "");

          break;
        case "修改root密码":
          content = sendUtils.parseContent(instruction, chatMessage);

          stompClient.send("/auth/rootpwd/" + content, {}, "");

          break;
        case "投票切歌率":
          content = sendUtils.parseContent(instruction, chatMessage);

          stompClient.send("/music/vote/" + content, {}, "");

          break;
        case "点赞模式":
          stompClient.send("/music/goodmodel/true", {}, "");
          break;
        case "退出点赞模式":
          stompClient.send("/music/goodmodel/false", {}, "");
          break;
           case "留存房间":
          stompClient.send("/house/retain/true", {}, "");
          break;
        case "不留存房间":
          stompClient.send("/house/retain/false", {}, "");
          break;
        case "禁止点歌":
          stompClient.send("/music/banchoose/true", {}, "");
          break;
        case "禁止切歌":
          stompClient.send("/music/banswitch/true", {}, "");
          break;
        case "启用切歌":
          stompClient.send("/music/banswitch/false", {}, "");
          break;
        case "启用点歌":
          stompClient.send("/music/banchoose/false", {}, "");
          break;
        case "拉黑用户":
          content = sendUtils.parseContent(instruction, chatMessage);
          if (content === "") {
            // console.log('请输入要拉黑的用户 session', chatMessage)
          } else {
            stompClient.send(
              "/chat/black",
              {},
              JSON.stringify({
                sessionId: content,
                sendTime: Date.now()
              })
            );
          }
          break;
        case "漂白用户":
          content = sendUtils.parseContent(instruction, chatMessage);
          if (content === "") {
            // console.log('请输入要漂白的用户 session', chatMessage)
          } else {
            stompClient.send(
              "/chat/unblack",
              {},
              JSON.stringify({
                sessionId: content,
                sendTime: Date.now()
              })
            );
          }
          break;
         case "设置点歌人":
          content = sendUtils.parseContent(instruction, chatMessage);
          if (content === "") {
            // console.log('请输入要拉黑的用户 session', chatMessage)
          } else {
            stompClient.send(
              "/auth/setPicker/"+content,
              {},
              ""
            );
          }
          break;
         case "取消点歌人":
          content = sendUtils.parseContent(instruction, chatMessage);
          if (content === "") {
            // console.log('请输入要拉黑的用户 session', chatMessage)
          } else {
            stompClient.send(
              "/auth/setNoPicker/"+content,
              {},
              ""
            );
          }
          break;
           case "设置切歌人":
          content = sendUtils.parseContent(instruction, chatMessage);
          if (content === "") {
            // console.log('请输入要拉黑的用户 session', chatMessage)
          } else {
            stompClient.send(
              "/auth/setVoter/"+content,
              {},
              ""
            );
          }
          break;
         case "取消切歌人":
          content = sendUtils.parseContent(instruction, chatMessage);
          if (content === "") {
            // console.log('请输入要拉黑的用户 session', chatMessage)
          } else {
            stompClient.send(
              "/auth/setNoVoter/"+content,
              {},
              ""
            );
          }
          break;
        case "拉黑音乐":
          content = sendUtils.parseContent(instruction, chatMessage);
          if (content === "") {
            // console.log('请输入要拉黑的音乐 id', chatMessage);
          } else {
            stompClient.send(
              "/music/black",
              {},
              JSON.stringify({
                id: content,
                sendTime: Date.now()
              })
            );
          }
          break;
        case "漂白音乐":
          content = sendUtils.parseContent(instruction, chatMessage);
          if (content === "") {
          } else {
            // console.log('请输入要漂白的音乐 id', chatMessage);
            stompClient.send(
              "/music/unblack",
              {},
              JSON.stringify({
                id: content,
                sendTime: Date.now()
              })
            );
          }
          break;
        case "@管理员":
          content = sendUtils.parseContent(instruction, chatMessage);
          if (content === "") {
          } else {
            stompClient.send(
              "/mail/send",
              {},
              JSON.stringify({
                content: content,
                sendTime: Date.now()
              })
            );
          }
          break;
        default:
          if (
            chatMessage === null ||
            chatMessage === "" ||
            chatMessage.length === 0
          ) {
            // console.log('消息非法', chatMessage);
          } else {
            stompClient.send(
              "/chat",
              {},
              JSON.stringify({
                content: chatMessage,
                sendTime: Date.now()
              })
            );
          }
          break;
      }

      this.$store.commit("setChatMessage", "");
    },
    messageHandler: function(source) {
      // console.log('消息处理器收到消息', source);
      if (messageUtils.isKnowMessageType(source.data)) {
        let messageType = messageUtils.parseMessageType(source.data);
        let messageContent = messageUtils.parseMessageContent(source.data);
        switch (messageType) {
          case messageUtils.messageType.ONLINE:
            if (
              messageContent.data.count !== undefined &&
              typeof messageContent.data.count !== "undefined" &&
              messageContent.data.count !== null &&
              messageContent.data.count !== ""
            ) {
              this.$store.commit("setSocketOnline", messageContent.data.count);
            }
            break;
          case messageUtils.messageType.NOTICE:
            if (
              messageContent.message !== undefined &&
              typeof messageContent.message !== "undefined" &&
              messageContent.message !== null &&
              messageContent.message !== ""
            ) {
              this.$store.commit("pushChatData", {
                content: messageContent.message,
                type: "notice"
              });
              this.$toast.message(messageContent.message);
            }
            break;
          case messageUtils.messageType.CHAT:
            // parse picture
            let imgList = [];
            let matchUrlList = messageContent.data.content.match(
              /[picture].*?:\/\/[^\s]*/gi
            );
            if (matchUrlList !== null) {
              for (let i = 0; i < matchUrlList.length; i++) {
                imgList.push(matchUrlList[i].replace("picture:", ""));
                messageContent.data.content = messageContent.data.content.replace(
                  matchUrlList[i],
                  ""
                );
              }
            }
            messageContent.data.images = imgList;
            this.$store.commit("pushChatData", messageContent.data);
            break;
          case messageUtils.messageType.GOODMODEL:
            var data = messageContent.data;
            if (data == "GOOD") {
              this.$store.commit("setSocketGood", true);
            } else {
              this.$store.commit("setSocketGood", false);
            }
            // this.$forceUpdate();

            break;
          case messageUtils.messageType.PICK:
            if (messageContent.message == "goodlist") {
              this.$store.commit("setSocketGood", true);
            }
            this.$store.commit("setPlayerPick", messageContent.data);
            if (messageContent.data.length > 1) {
              this.secondUrl = messageContent.data[1].url;
              //console.log("this.firstLoaded"+this.firstLoaded);
              if (this.firstLoaded == 1) {
                this.$store.commit("setMusic2", { url: this.secondUrl });
              }
            }
            break;
          case messageUtils.messageType.VOLUMN:
            //console.log(messageContent.data);
            music.volume = Number(messageContent.data) / 100;
            this.$store.commit("setPlayerVolume", messageContent.data);

            break;
          case messageUtils.messageType.MUSIC:
            this.firstLoaded = 0;
            this.$store.commit("setPlayerMusic", messageContent.data);
            document.querySelector("#music").preload = "auto";
            if (
              messageContent.data.lyric === undefined ||
              typeof messageContent.data.lyric === "undefined" ||
              messageContent.data.lyric === null ||
              messageContent.data.lyric === ""
            ) {
              this.$store.commit("setPlayerLyrics", []);
            } else {
              this.$store.commit(
                "setPlayerLyrics",
                musicUtils.parseLyric(messageContent.data.lyric)
              );
            }
            document.title = messageContent.data.name;
            break;
          case messageUtils.messageType.AUTH_ROOT:
            this.$store.commit("pushChatData", {
              content: messageContent.message,
              type: "notice"
            });
            if (Number(messageContent.code) === 20000) {
              this.$store.commit("setSocketRoot", true);
              // console.log('root success')
            } else {
              this.$store.commit("setSocketRoot", false);
            }
            break;
          case messageUtils.messageType.ENTER_HOUSE:
            this.loading.close();
            if (Number(messageContent.code) === 20000) {
              this.houseId = this.houseIdNoAction;
              this.housePwd = this.housePwdNoAction;
              this.connectType = this.connectTypeNoAction;
              this.musichouse = this.houseForward;
              // console.log('root success')
              this.openHouse = false;
              document
                .querySelectorAll(".mu-tooltip")
                .forEach(el => (el.style.display = "none"));
            } else {
              this.$toast.message(messageContent.message);
              this.getHouses();
            }
            break;
          case messageUtils.messageType.ADD_HOUSE:
            this.loading.close();
            if (Number(messageContent.code) === 20000) {
              this.musichouse = this.house.name;
              this.houseId = messageContent.data;
              this.housePwd = this.house.password;
              this.connectType = "";
              // console.log('root success')
              this.openHouse = false;
              document
                .querySelectorAll(".mu-tooltip")
                .forEach(el => (el.style.display = "none"));
            } else {
              this.$toast.message(messageContent.message);
            }
            break;
          case messageUtils.messageType.AUTH_ADMIN:
            this.$store.commit("pushChatData", {
              content: messageContent.message,
              type: "notice"
            });
            if (Number(messageContent.code) === 20000) {
              this.$store.commit("setSocketAdmin", true);
              // console.log('admin success')
            } else {
              this.$store.commit("setSocketAdmin", false);
            }
            break;
          case messageUtils.messageType.SETTING_NAME:
            this.$store.commit("pushChatData", {
              content: messageContent.message,
              type: "notice"
            });
            this.$store.commit("setSocketUserName", messageContent.data.name);
            break;
          case messageUtils.messageType.SEARCH:
            this.$store.commit("setSearchCount", messageContent.data.totalSize);
            this.$store.commit("setSearchData", messageContent.data.data);
            break;
          case messageUtils.messageType.SEARCH_SONGLIST:
            this.$store.commit("setSearchCountGd", messageContent.data.totalSize);
            this.$store.commit("setSearchDataGd", messageContent.data.data);
            break;
           case messageUtils.messageType.SEARCH_USER:
            this.$store.commit("setSearchCountUser", messageContent.data.totalSize);
            this.$store.commit("setSearchDataUser", messageContent.data.data);
            break;
          case messageUtils.messageType.SEARCH_HOUSE:
            this.houses = messageContent.data;
            break;
          case messageUtils.messageType.SEARCH_PICTURE:
            this.$store.commit(
              "setSearchPictureCount",
              messageContent.data.totalSize
            );
            this.$store.commit(
              "setSearchPictureData",
              messageContent.data.data
            );
            break;
          default:
            // console.log('未知消息类型', messageType, source);
            break;
        }
      }
    },
    updateChatMessage: function(value) {
      this.$store.commit("setChatMessage", value);
    },
    updateSearchKeyword: function(value) {
      this.$store.commit("setSearchKeyword", value);
    },
    updateSearchKeywordGd: function(value) {
      this.$store.commit("setSearchKeywordGd", value);
    },
     updateSearchKeywordUser: function(value) {
      this.$store.commit("setSearchKeywordUser", value);
    },
    settingName: function(name) {
      let stompClient = this.$store.getters.getStompClient;
      stompClient.send(
        "/setting/name",
        {},
        JSON.stringify({
          name: name,
          sendTime: Date.now()
        })
      );
    },
    search: function() {
      let stompClient = this.$store.getters.getStompClient;
      stompClient.send(
        "/music/search",
        {},
        JSON.stringify({
          name: this.$store.getters.getSearchKeyword.trim(),
          sendTime: Date.now(),
          source: this.source,
          pageIndex: this.current,
          pageSize: this.limit
        })
      );
    },
    searchGd: function() {
      let stompClient = this.$store.getters.getStompClient;
      stompClient.send(
        "/music/searchsonglist",
        {},
        JSON.stringify({
          name: (this.$store.getters.getSearchKeywordGd+"").trim(),
          sendTime: Date.now(),
          source: this.sourceGd,
          pageIndex: this.currentGd,
          pageSize: this.limit
        })
      );
    },
     searchUser: function() {
      let stompClient = this.$store.getters.getStompClient;
      stompClient.send(
        "/music/searchuser",
        {},
        JSON.stringify({
          nickname: this.$store.getters.getSearchKeywordUser.trim(),
          sendTime: Date.now(),
          source: this.sourceUser,
          pageIndex: this.currentUser,
          pageSize: this.limit
        })
      );
    },
    paginationChange: function(page) {
      this.current = page;
      this.search();
    },
     paginationChangeGd: function(page) {
      this.currentGd = page;
      this.searchGd();
    },
     paginationChangeUser: function(page) {
      this.currentUser = page;
      this.searchUser();
    },
    goodMusic: function(row) {
      let stompClient = this.$store.getters.getStompClient;
      stompClient.send("/music/good/" + row.id, {}, {});
      this.$toast.message(`[${row.id}]${row.name} - 已发送点赞请求`);
    },
    pickMusic: function(row) {
      let stompClient = this.$store.getters.getStompClient;
      stompClient.send(
        "/music/pick",
        {},
        JSON.stringify({
          name: row.name,
          id: row.id,
          source: this.source,
          sendTime: Date.now()
        })
      );
      this.$toast.message(`[${row.id}]${row.name} - 已发送点歌请求`);
    },
    showPickButton(value) {
      if (Number(value.st) < 0) {
        // 没有资源
        return false;
      } else if (Number(value.fl) === 0) {
        // 可能需要付费
        return false;
      }
      return true;
    },
     songlistDetail(value) {
       this.openSearchGd = false;
       this.openSearch = true;
       this.$store.commit("setSearchKeyword",  "*"+value.id);
       this.source = this.sourceGd.startsWith("wy")?"wy":"qq";
       this.current = 1;
       this.search();
    },
     songtableDetail(value) {
       this.openSearchUser = false;
       this.openSearchGd = true;
       this.$store.commit("setSearchKeywordGd",  value.userId);
       this.sourceGd = this.sourceUser+"_user";
       this.currentGd = 1;
       this.searchGd();
    },
    musicSkipVote: function() {
      let stompClient = this.$store.getters.getStompClient;
      stompClient.send("/music/skip/vote", {}, {});
    },
    musicTimeUpdate: function(e) {
      // progress
      let currentTime = e.target.currentTime;
      let duration = e.target.duration;
      this.$store.commit("setPlayerProgress", (currentTime / duration) * 100);

      // show time
      let usedTimeHH_mm_ss = timeUtils.secondsToHH_mm_ss(currentTime);
      let durationHH_mm_ss = timeUtils.secondsToHH_mm_ss(duration);
      let time = usedTimeHH_mm_ss + " / " + durationHH_mm_ss;
      this.$store.commit("setPlayerTime", time);

      // lyric
      let lyrics = this.$store.getters.getPlayerLyrics;
      if (lyrics.length === 0) {
        this.$store.commit("setPlayerLyric", "暂无歌词");
      } else {
        let number = Number(currentTime.toFixed());
        if (lyrics[number] !== undefined && lyrics[number] !== "") {
          this.$store.commit("setPlayerLyric", lyrics[number]);
        }
      }
    },
    getScreenWidth: function() {
      const _this = this;
      window.onresize = () => {
        return (() => {
          _this.screenWidth = document.documentElement.clientWidth;
        })();
      };
    },
    formatterTime: function(value) {
      return timeUtils.secondsToHH_mm_ss(value);
    },
    nextSong: function(e) {
      this.firstLoaded = 1;
      this.$store.commit("setMusic2", { url: this.secondUrl });
      //document.querySelector('#music2').src = this.secondUrl;

      //console.log(this.secondUrl);
    },
    closeHouse() {
      this.openHouse = false;
    },
     closeGd() {
      this.openSearchGd = false;
    },
    closeUser() {
      this.openSearchUser = false;
    },
    openGd(){
      this.openSearch = false;
      this.openSearchGd = true;
    },
    openGdFromUser(){
      this.openSearchUser = false;
      this.openSearchGd = true;
    },
     openGq(){
      this.openSearchGd = false;
      this.openSearch = true;
    },
       openUser(){
      this.openSearchGd = false;
      this.openSearchUser = true;
    },
     closeGq() {
      this.openSearch = false;
    },
    createHouse() {
      this.loading = this.$loading({ overlayColor: "hsla(0, 0%, 100%, .5)" });
      let stompClient = this.$store.getters.getStompClient;
      stompClient.send(
        "/house/add",
        {},
        JSON.stringify({
          name: this.house.name,
          desc: this.house.desc,
          needPwd:this.house.needPwd,
          password:this.house.password
        })
      );
    },
     createHomeHouse() {
      this.loading = this.$loading({ overlayColor: "hsla(0, 0%, 100%, .5)" });
       this.$http.post("/house/add",{  name: this.homeHouse.name,
          desc: this.homeHouse.desc,
          needPwd:this.homeHouse.needPwd,
          password:this.homeHouse.password})
        .then(response => {
          this.loading.close();
          if(response.data.code=="20000"){
            this.houseId = response.data.data;
            this.housePwd = this.homeHouse.password;
            this.connectType = "";
            this.play();
            this.musichouse = this.homeHouse.name;
                document
                .querySelectorAll(".mu-tooltip")
                .forEach(el => (el.style.display = "none"));
          }else{
            this.$toast.message(response.data.message);
          }
         
        })
        .catch(error => {
            this.loading.close();
        })
    },
    enterHouse(id, name, needPwd) {
      if (needPwd) {
        this.$prompt("", "请输入房间密码", {
          validator(value) {
            return {
              valid: value != "",
              message: "密码不能为空"
            };
          }
        }).then(({ result, value }) => {
          if (result) {
            this.houseEnter(id, name, value);
          } else {
            //this.$toast.message('点击了取消');
          }
        });
      } else {
        this.houseEnter(id, name, "");
      }
    },
     enterHomeHouse(id, name, needPwd) {
      if (needPwd) {
        this.$prompt("", "请输入房间密码", {
          validator(value) {
            return {
              valid: value != "",
              message: "密码不能为空"
            };
          }
        }).then(({ result, value }) => {
          if (result) {
            this.homeHouseEnter(id, name, value);
          } else {
            //this.$toast.message('点击了取消');
          }
        });
      } else {
        this.homeHouseEnter(id, name, "");
      }
    },
    houseEnter(id, name, pwd) {
      this.loading = this.$loading({ overlayColor: "hsla(0, 0%, 100%, .5)" });
      this.houseIdNoAction = id;
      this.housePwdNoAction = pwd;
      this.connectTypeNoAction = "enter";
      this.houseForward = name;
      let stompClient = this.$store.getters.getStompClient;
      stompClient.send(
        "/house/enter",
        {},
        JSON.stringify({
          id: id,
          password: pwd
        })
      );
    },
     homeHouseEnter(id, name, pwd) {
      this.loading = this.$loading({ overlayColor: "hsla(0, 0%, 100%, .5)" });

      this.$http.post("/house/enter",{ "id": id,
          "password": pwd})
        .then(response => {
          this.loading.close();
          if(response.data.code=="20000"){
            this.houseId = id;
            this.housePwd = pwd;
            this.connectType = "enter";
            this.play();
            this.musichouse = name;
             document
                .querySelectorAll(".mu-tooltip")
                .forEach(el => (el.style.display = "none"));
          }else{
            this.$toast.message(response.data.message);
          }
         
        })
        .catch(error => {
            this.loading.close();
        })
  
    },
    getHouses() {
      let stompClient = this.$store.getters.getStompClient;
      stompClient.send("/house/search", {}, JSON.stringify({}));
    },
    getHomeHouses() {
       this.$http.post("/house/search",{})
        .then(response => {
          if(response.data.code=="20000"){
            this.homeHouses = response.data.data;
          }
         
        })
        .catch(error => {
        })
     
    },
    clearScr() {
      document.getElementById("chat-container").innerHTML = "";
    },
    setCurrentTime() {
      this.playingId= this.$store.getters.getPlayerMusic.id + this.$store.getters.getPlayerMusic.source+this.$store.getters.getPlayerMusic.pushTime;
    
    },
    linkDownload (url) {

      window.open(url,'_blank') // 新窗口打开外链接

    },
    playMusic(){
        document.querySelector("#music").play();
    },
    createTouchstartEventAndDispatch (el) {
      try{
         let event = document.createEvent('Events');
         event.initEvent('touchstart', true, true);
         el.dispatchEvent(event);
      }catch(Exception){
      }
    },
    //生成二维码
    getQRcode() {
      this.homeDesc = "";
       this.$http.post("/house/get",{  id: this.houseId})
        .then(response => {
          if(response.data.code=="20000"){
            this.homeDesc = response.data.data.desc;
          }else{
            this.$toast.message(response.data.message);
          }
         
        })
        .catch(error => {
        })
      let queryString = "houseId="+this.houseId+"&housePwd="+this.housePwd;
      this.qrcodeVue.value = "http://www.alang.run/syncmusic?"+encodeURIComponent(queryString);	// 二维码内容
    },
    reachHouse(){
      let housePwd = this.getUrlKey("housePwd");
      this.homeHouseEnter(this.houseReachId,this.houseReachName,housePwd);
    },
    getUrlKey(name){
    if(window.location.href.indexOf("?houseId") != -1){
       let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
       let r = decodeURIComponent(window.location.search).substr(1).match(reg);  //获取url中"?"符后的字符串并正则匹配
       let context = ""; 
       if (r != null) 
          context = r[2]; 
       reg = null; 
       r = null; 
       return context == null || context == "" || context == "undefined" ? "" : context; 
    }else{
      return null;
    }
    },
    setTimeToClose(minutes){
      if(this.closeClock){
        window.clearTimeout(this.closeClock);
      }
      if(minutes != 0){
          this.closeClock = window.setTimeout(this.close,minutes*60*1000);
      }
    }
  },
  watch: {
    sourceGd:function(newValue,oldValue){
      this.currentGd=1;
      if(newValue=="qq_user"){
          this.placeHolderGd= "qq用户id即qq号";
      }else if(newValue =="wy_user"){
          this.placeHolderGd="用户id不知，点右上用户";
      }else{
          let placeholders = ["搜索[民谣]来听下吧","试下为空搜索(*^__^*)","请输入关键字，如'摇滚'"];
          this.placeHolderGd= placeholders[Math.floor(Math.random()*3)];
      }
    },
    source:function(newValue,oldValue){
         this.current=1;
         let placeholders = ["请输入关键字搜索,如'遇见'","歌单id搜索:'*歌单id'","不知听啥，点右上歌单..."];
          this.placeHolderGq= placeholders[Math.floor(Math.random()*3)];
    
    },
    playingId:function(newValue,oldValue){
      let _this = this;
      if(newValue !="" && newValue != oldValue){
        this.albumRotate = false;
        document.querySelector("#music").volume =
        Number(this.$store.getters.getPlayerVolume) / 100;

      setTimeout(function() {
        _this.albumRotate = true;
        let pushTime = _this.$store.getters.getPlayerMusic.pushTime;
        if (pushTime) {
          document.querySelector("#music").currentTime =
            (Date.now() - pushTime) / 1000;
             _this.createTouchstartEventAndDispatch(document);
        }
      }, 1000);
      }
    },
    openHouse: function(newOpenHouse, oldOpenHouse) {
      if (newOpenHouse) {
        this.getHouses();
      }
    },
     openShare: function(newOpenHouse, oldOpenHouse) {
      if (newOpenHouse) {
        this.getQRcode();
      }
    },
    "$store.state.player.music": function(newValue, oldValue) {
      // var audio = document.getElementById("music");
      // 解决部分移动端不能自动播放
      document.addEventListener("touchstart", function() {
        //_this.$toast.message("调用touchstart");
        document.getElementById("music").play();
        // audio.play();
      });

        if (window.WeixinJSBridge) {
            WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
                document.getElementById("music").play();
            }, false);
        } else {
            document.addEventListener("WeixinJSBridgeReady", function () {
                WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
                    document.getElementById("music").play();
                });
            }, false);
        }

      // wx.ready(function() {
      //     _this.$toast.message("调用weixin");
      //     document.querySelector("#music").play();
      // });
      // this.createTouchstartEventAndDispatch(document);
      // wx.config({
      //           debug:false,
      //           appId:"",
      //           timestamp:1,
      //           nonceStr:"",
      //           signature:"",
      //           jsApiList:[]
      //       });
      //       wx.ready(function(){
      //           var autoplayVideo=document.getElementById("music");
      //           autoplayVideo.play()
      //       })
      // this.albumRotate = false;
             // 解决部分移动端不能自动播放
      // document.addEventListener("touchstart", function() {
      //   document.querySelector("#music").play();
      // });
      // document.addEventListener("touchend", function() {
      //   let audio =  document.querySelector("#music");
      //   if(audio.paused){
      //     audio.play();
      //   }
      // });
      //  document.addEventListener("touchcancel", function() {
      //   let audio =  document.querySelector("#music");
      //   if(audio.paused){
      //     audio.play();
      //   }
      // });
      //  document.addEventListener("click", function() {
      //   let audio =  document.querySelector("#music");
      //   if(audio.paused){
      //     audio.play();
      //   }
      // });
      // setTimeout(function() {
      //   _this.albumRotate = true;
      //   let pushTime = _this.$store.getters.getPlayerMusic.pushTime;
      //   if (pushTime) {
      //     document.querySelector("#music").currentTime =
      //       (Date.now() - pushTime) / 1000;
      //   }
      // }, 1000);
    },
    "$store.state.chat.data": function(newValue, oldValue) {
      setTimeout(function() {
        let chat = document.querySelector("#chat-container");
        chat.scrollTop = chat.scrollHeight;
      }, 100);
    },
    screenWidth(val) {
      //监控浏览器高度变化
      if (!this.timer) {
        this.screenWidth = val;
        this.timer = true;
        let _this = this;
        setTimeout(function() {
          _this.timer = false;
        }, 400);
      }
      if (val <= 400) {
        this.albumRotateStyle =
          "border:60px solid rgb(12, 12, 12); padding: 8px;";
        this.pageCount = 3;
      }
      if (val > 400 && val <= 766) {
        this.albumRotateSize = 450;
        this.albumRotateStyle =
          "border:70px solid rgb(12, 12, 12); padding: 8px;";
        this.pageCount = 5;
      }
      if (val > 766 && val < 1000) {
        this.albumRotateSize = 160;
        this.albumRotateStyle =
          "border:32px solid rgb(12, 12, 12); padding: 4px;";
        this.pageCount = 9;

      }
      if (val >= 1000) {
        this.albumRotateSize = 200;
        this.albumRotateStyle =
          "border:40px solid rgb(12, 12, 12); padding: 4px;";
          this.pageCount = 11;

      }
      // console.log(this.pageCount+"dd");
    }
  },
  mounted() {
    this.getScreenWidth();
     this.$nextTick(function () {
      this.$http.defaults.baseURL = baseUrl;

      this.getHomeHouses();
      try{
          let houseId = this.getUrlKey("houseId");
          if(houseId){
            this.openShareReach = true;
            this.houseReachId=houseId;
            this.$http.post("/house/get",{  id: houseId})
              .then(response => {
              if(response.data.code=="20000"){
                    this.houseReachName = response.data.data.name;
              }else{
                  this.$toast.message(response.data.message);
              }
         
          })
            .catch(error => {
            })
         }
      }catch(Exception){

      }
   


    // Code that will run only after the
    // entire view has been rendered
    })
    wx.config({
            // 配置信息, 即使不正确也能使用 wx.ready
            debug: false,
            appId: '',
            timestamp: 1,
            nonceStr: '',
            signature: '',
            jsApiList: []
        });
  },
  created() {
    // let val = this.albumRotateSize;
    let val = document.documentElement.clientWidth;
    // console.log(val);

    if (val <= 400) {
      this.pageCount =3;
    }
    if (val > 400 && val <= 700) {
      this.albumRotateSize = val - 60;
      this.albumRotateStyle = `border:${Math.floor(val / 10) +
        10}px solid rgb(12, 12, 12);`;
      this.pageCount = 5;
    }
    if (val > 700 && val <= 766) {
      this.albumRotateSize = 450;
      this.albumRotateStyle = "border:70px solid rgb(12, 12, 12);";
            this.pageCount = 7;

    }
    if (val > 766 && val < 1000) {
      this.albumRotateSize = 160;
      this.albumRotateStyle = "border:32px solid rgb(12, 12, 12);";
            this.pageCount = 9;

    }
    if (val >= 1000) {
      this.albumRotateSize = 200;
      this.albumRotateStyle = "border:40px solid rgb(12, 12, 12);";
            this.pageCount = 11;

    }
  }
};
</script>

<style lang="scss" scoped>
.demo-container {
  .row {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.album {
  width: 100%;
  display: inline-block;
  cursor: pointer;
  transition-duration: 0.2s;
  padding: 4px;
  border: 32px solid rgb(16, 16, 16);
  border-radius: 50%;
  background: linear-gradient(
    rgb(39, 39, 39),
    rgb(0, 0, 0),
    rgb(0, 0, 0),
    rgb(39, 39, 39)
  );
  /*box-shadow: 0 0 20px 2px #000;*/
}

.album-rotate {
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
