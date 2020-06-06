<template>
  <div>
    <div v-if="isPlay">
      <navigation :musichouse="musichouse"></navigation>
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
                  style="text-align: center; padding: 0 0 40px 0;"
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
              </div>
            </mu-col>
            <mu-col style="margin-bottom: 160px; ">
              <div style="padding: 10px 0">
                <mu-divider></mu-divider>
                <div style="padding: 10px 0">
                  <mu-chip
                    color="rgba(0, 150, 136, 0.5)"
                    @click="openPictureSearch = !openPictureSearch"
                  >搜索图片</mu-chip>
                  <mu-chip color="rgba(0, 150, 136, 0.5)" @click="musicSkipVote">投票切歌</mu-chip>
                  <mu-chip color="rgba(0, 150, 136, 0.5)" @click="openSearch = !openSearch">搜索音乐</mu-chip>
                </div>
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
                  >[搜索音乐]</span>” 吧
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
                  <span @click="musicSkipVote" style="cursor: pointer; color: #009688;">[投票切歌]</span>”，当投票人数大于在线人数 30% 时将会切歌。
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
                  >[搜索图片]</span>”
                </p>
                <br />
                <p>
                  <span style="color: orange;">管理员功能</span>
                </p>
                <p>
                  ：登录： “
                  <span style="color: #009688;">admin 123456</span>” 。
                  修改密码： “
                  <span style="color: #009688;">修改密码 123456</span>” 。
                  点赞模式（歌曲列表按点赞数排序）： “
                  <span style="color: #009688;">点赞模式</span>” 退出则“
                  <span style="color: #009688;">退出点赞模式</span>” 。
                  修改投票切歌率： “
                  <span style="color: #009688;">投票切歌率 1</span>” 数值在(0,1]。
                  禁止切歌：“
                  <span style="color: #009688;">禁止切歌</span>” 启用则“
                  <span style="color: #009688;">启用切歌</span>” 。
                  禁止点歌：“
                  <span style="color: #009688;">禁止点歌</span>” 启用则“
                  <span style="color: #009688;">启用点歌</span>” 。
                  清空列表：“
                  <span style="color: #009688;">清空列表</span>” 。
                  置顶音乐： “
                  <span style="color: #009688;">置顶音乐 音乐id</span>” 音乐id即歌曲列表中歌曲后面那一串字母，如411214279。
                  拉黑音乐：“
                  <span style="color: #009688;">拉黑音乐 音乐id</span>” 漂白则“
                  <span style="color: #009688;">漂白音乐 音乐id</span>” 。
                  音乐黑名单： “
                  <span style="color: #009688;">音乐黑名单</span>” 。
                  拉黑用户：“
                  <span style="color: #009688;">拉黑用户 用户id</span>” 漂白则“
                  <span style="color: #009688;">漂白用户 用户id</span>” 用户id即用户ip后面那一串字母，如ju2etxv2。
                  用户黑名单： “
                  <span style="color: #009688;">用户黑名单</span>” 。
                </p>
                <br />
                <p>
                  如果有什么好的想法、建议或问题可以单项向管理员发送消息，（＾∀＾●）ﾉｼ
                  “
                  <span style="color: #009688;">@管理员 内容</span>”,
                  空格隔开哦!
                </p>
                <p>另外也可以在项目仓库开个 issue 进行公开讨论</p>
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
          style="display: none"
        ></audio>
        <audio id="music2" :src="music2.url" style="display: none"></audio>
      </div>
    </div>
    <div id="play" v-if="!isPlay" style="position: fixed; width: 100%; height:100%">
      <mu-button color="success" style="float:right" @click="play">多房间版本V1.0</mu-button>
      <mu-button color="success" style="float:right" @click="linkDownload('http://www.alang.run/release')">安卓APP</mu-button>
      <mu-icon
        @click="play"
        value="play_circle_filled"
        color="primary"
        size="150"
        style="position: fixed; top: calc(50% - 75px); left: calc(50% - 75px); cursor: pointer;"
      ></mu-icon>
    </div>
    <mu-dialog id="search" width="auto" :open.sync="openSearch">
      <mu-container>
        <mu-row>
          <mu-col span="11">
            <mu-text-field
              :value="searchKeyword"
              @input="updateSearchKeyword"
              @keydown.enter="search"
              placeholder="请输入关键字搜索..."
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
    <mu-dialog id="search-picture" width="auto" :open.sync="openPictureSearch">
      <chat-search-picture></chat-search-picture>
    </mu-dialog>
    <mu-dialog
      id="house_dialog"
      width="100%"
      transition="slide-bottom"
      fullscreen
      :open.sync="openHouse"
    >
      <mu-appbar color="primary" title="房间">
        <mu-button slot="right" flat @click="closeHouse">X</mu-button>
      </mu-appbar>
      <mu-form :model="house" class="mu-demo-form" align="center">
        <mu-text-field v-model="house.name" placeholder="房间名称"></mu-text-field>
        <mu-text-field v-model="house.desc" placeholder="房间描述"></mu-text-field>
        <mu-text-field
          v-if="house.needPwd"
          placeholder="房间密码"
          v-model="house.password"
          :action-icon="visibility ? 'visibility_off' : 'visibility'"
          :action-click="() => (visibility = !visibility)"
          :type="visibility ? 'text' : 'password'"
        ></mu-text-field>
        <mu-switch v-model="house.needPwd" color="primary" label="密码"></mu-switch>

        <div align="center">
          <mu-button color="primary" @click="createHouse">创建房间</mu-button>
        </div>
      </mu-form>
      <div align="center" style="padding-top:30px;">
        <span
          v-for="house, index in houses"
          :key="house.id"
          @click="enterHouse(house.id,house.name,house.needPwd)"
        >
          <mu-tooltip :content="house.desc">
            <mu-chip class="demo-chip" color="teal">
              <mu-avatar :size="32" color="blue300">
                <mu-icon :value="house.needPwd?'lock':'lock_open'"></mu-icon>
              </mu-avatar>
              {{house.name}}
            </mu-chip>
          </mu-tooltip>
        </span>
      </div>
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

export default {
  name: "Music",
  components: {
    Navigation,
    ChatSearchPicture
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
      searchData: "getSearchData",
      searchCount: "getSearchCount",
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
    openHouse: false,
    searchColumns: [
      { title: "ID", name: "id", width: 40, align: "left" },
      // {title: '操作', name: 'op', align: 'center'},
      { title: "歌曲", name: "name", width: 200, align: "left" },
      { title: "歌手", name: "artist", align: "center" },
      { title: "专辑", name: "album", align: "center" },
      { title: "时长", name: "duration", align: "center" }
    ],
    keyword: "",
    current: 1,
    limit: 10,
    pageCount: 7,
    openPictureSearch: false,
    source: "wy",
    sourceChat: "wy",
    house: { name: "", desc: "", password: "", needPwd: false },
    secondUrl: "",
    firstLoaded: 0,
    houses: [],
    musichouse: "一起听歌吧",
    loading: {},
    houseForward: "",
    visibility: false
  }),
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

      socketClient = new SockJS(baseUrl + "/server"); // new SockJS("https://www.alang.run" + '/wss');//
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

      this.saveSocket(socketClient, stompClient);
    },
    subscribe: function() {
      let stompClient = this.$store.getters.getStompClient;

      stompClient.subscribe("/topic/chat", response => {
        console.log("来自 /topic/chat 频道的消息", response);
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
        case "清空列表":
          stompClient.send("/music/clear", {}, "");
          break;
        case "音乐黑名单":
          stompClient.send("/music/blackmusic", {}, "");
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
    paginationChange: function(page) {
      this.current = page;
      this.search();
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
      //console.log("第二首");
    },
    closeHouse() {
      this.openHouse = false;
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
        console.log(name);
        this.houseEnter(id, name, "");
      }
    },
    houseEnter(id, name, pwd) {
      this.loading = this.$loading({ overlayColor: "hsla(0, 0%, 100%, .5)" });

      console.log(name);
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
    getHouses() {
      let stompClient = this.$store.getters.getStompClient;
      stompClient.send("/house/search", {}, JSON.stringify({}));
    },
    clearScr() {
      document.getElementById("chat-container").innerHTML = "";
    },
    setCurrentTime() {
      console.log(this.music.pushTime);
      document.querySelector("#music").currentTime =
        (Date.now() - this.music.pushTime) / 1000;
    },
    linkDownload (url) {

      window.open(url,'_blank') // 新窗口打开外链接

    }
  },
  watch: {
    openHouse: function(newOpenHouse, oldOpenHouse) {
      if (newOpenHouse) {
        this.getHouses();
      }
    },
    "$store.state.player.music": function(newValue, oldValue) {
      let _this = this;
      this.albumRotate = false;
      document.querySelector("#music").volume =
        Number(this.$store.getters.getPlayerVolume) / 100;
      // 解决部分移动端不能自动播放
      document.addEventListener("touchstart", function() {
        document.querySelector("#music").play();
      });
      setTimeout(function() {
        _this.albumRotate = true;
        if (newValue.pushTime) {
          document.querySelector("#music").currentTime =
            (Date.now() - newValue.pushTime) / 1000;
        }
      }, 1000);
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
        this.pageCount = 1;
      }
      if (val > 400 && val <= 766) {
        this.albumRotateSize = 450;
        this.albumRotateStyle =
          "border:70px solid rgb(12, 12, 12); padding: 8px;";
        this.pageCount = 3;
      }
      if (val > 766 && val < 1000) {
        this.albumRotateSize = 160;
        this.albumRotateStyle =
          "border:32px solid rgb(12, 12, 12); padding: 4px;";
      }
      if (val >= 1000) {
        this.albumRotateSize = 200;
        this.albumRotateStyle =
          "border:40px solid rgb(12, 12, 12); padding: 4px;";
      }
    }
  },
  mounted() {
    this.getScreenWidth();
  },
  created() {
    // let val = this.albumRotateSize;
    let val = document.documentElement.clientWidth;
    // console.log(val);

    if (val <= 400) {
      this.pageCount = 1;
    }
    if (val > 400 && val <= 700) {
      this.albumRotateSize = val - 60;
      this.albumRotateStyle = `border:${Math.floor(val / 10) +
        10}px solid rgb(12, 12, 12);`;
      this.pageCount = 3;
    }
    if (val > 700 && val <= 766) {
      this.albumRotateSize = 450;
      this.albumRotateStyle = "border:70px solid rgb(12, 12, 12);";
    }
    if (val > 766 && val < 1000) {
      this.albumRotateSize = 160;
      this.albumRotateStyle = "border:32px solid rgb(12, 12, 12);";
    }
    if (val >= 1000) {
      this.albumRotateSize = 200;
      this.albumRotateStyle = "border:40px solid rgb(12, 12, 12);";
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
