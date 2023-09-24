<template>
  <div style="background-color: #bdbdbd">
    <mu-text-field
      v-model="roomId"
      label="请输入bili直播间房间号或者链接"
      style="width: 100%"
    ></mu-text-field>
     <mu-text-field
      v-model="switchLimit"
      label="超过多少人投票切歌"
      style="width: 100%"
    ></mu-text-field>
    <mu-button
      v-if="!connected"
      @click="connectBiliBili"
      style="margin-left: 90px"
      >连接直播间</mu-button
    >
    <mu-button
      v-if="connected"
      @click="disconnectBiliBili"
      style="margin-left: 90px"
      >断开连接</mu-button
    >
    <ul style="color: rgba(0, 0, 0, 0.57)">
      <li>1.点歌+歌曲，如点歌周杰伦晴天</li>
      <li>默认曲源网易云，如要切换qq，可以：点歌qq周杰伦晴天</li>
      <li>2.切歌：可以投票切换歌曲</li>
      <!-- <li>3.点赞歌曲，如点赞晴天,或者点赞3，3为歌曲顺序</li> -->
      <!-- <li v-for="message in messages" :key="message.time">
        {{ message.text }}
      </li> -->
    </ul>
  </div>
</template>

<script>
// import axios from 'axios';
// import brotli from 'brotli/decompress';

export default {
  components: {},
  props: {
    playingId: {
      type: String,
      default: ''
    }},
  data() {
    return {
      timer: {},
      roomId: "",
      connected: false,
      messages: [],
      socket: null,
      switchLimit:3,
      switchUsers:{}
    };
  },
  watch: {
    playingId(newValue,oldValue){
      let _this = this;
      console.log("新等于旧");
      if(newValue !="" && newValue != oldValue){
        _this.switchUsers={};
        // console.log("我清空了");
      }
      
    }
  },
  methods: {
    async getRoomId(id) {
      const response = await fetch(
        `https://tx.alang.run/bili/room/v1/Room/room_init?id=${id}`
      );
      if (response.status >= 200 && response.status < 300) {
        let text = await response.json();
        console.log(text);

        if (text.code == 0) {
          return text.data;
        } else {
          return {};
        }
      } else {
        return {};
      }
    },
    async getWebSocketHost(roomid) {
      const response = await fetch(
        `https://tx.alang.run/bili/room/v1/Danmu/getConf?room_id=${roomid}&platform=pc&player=web`
      );
      if (response.status >= 200 && response.status < 300) {
        let text = await response.json();
        //console.log(text);

        if (text.code == 0) {
          return text.data;
        } else {
          return {};
        }
      } else {
        return {};
      }
    },
    async connectBiliBili() {
      if(this.roomId && this.roomId.indexOf("h5/")){
        this.roomId = this.roomId.replace("h5/","");
      }
      let numberStrArray = this.roomId.match(/\d+/);
      if (numberStrArray != null) {
        this.roomId = numberStrArray[0];
      } else {
        return;
      }

      let realRoom = await this.getRoomId(this.roomId);
      let realRoomId = realRoom.room_id;
      console.log("roomId", realRoomId);
      let realData = await this.getWebSocketHost(realRoomId);
      console.log("realData", realData);
      this.socket = new WebSocket(`wss://${realData.host}/sub`);
      this.socket.binaryType = "arraybuffer";
      this.socket.addEventListener("open", () => {
        const joinData = {
          uid: 0,
          roomid: realRoomId,
          protover: 3,
          platform: "web",
          type: 2,
          key: realData.token,
        };
        // const joinMessage = new TextEncoder().encode(joinData)
        // const buffer = new ArrayBuffer(16)
        // const view = new DataView(buffer)
        // view.setInt32(0, 16 + joinMessage.byteLength)
        // view.setInt32(4, 16)
        // view.setInt32(8, 1)
        // view.setInt32(12, 7)
        // const join = new Uint8Array(buffer)
        // const sendBuffer = new Uint8Array(buffer.byteLength + joinMessage.byteLength)
        // sendBuffer.set(join)
        // sendBuffer.set(joinMessage, join.length)
        // this.socket.send(sendBuffer)
        this.connected = true;
        this.addMessage({ text: "连接直播间成功" });
        this.socket.send(
          this.getCertification(JSON.stringify(joinData)).buffer
        );

        //心跳包的定时器
        let _that = this;
        this.timer = setInterval(function () {
          //定时器 注意声明timer变量
          var n1 = new ArrayBuffer(16);
          var i = new DataView(n1);
          i.setUint32(0, 16), //封包总大小
            i.setUint16(4, 16), //头部长度
            i.setUint16(6, 1), //协议版本
            i.setUint32(8, 2), // 操作码 2 心跳包
            i.setUint32(12, 1); //就1
          _that.socket.send(i.buffer); //发送
        }, 30000);
      });
      this.socket.addEventListener("message", (evt) => {
        this.onMessage(evt);
        // const data = new TextDecoder().decode(event.data.slice(16))
        // const parsedData = JSON.parse(data)
        // if (parsedData.cmd === 'DANMU_MSG') {
        //   const [text] = parsedData.info
        //   this.addMessage({ text })
        // }
      });
    },
    onMessage(evt) {
      const data = this.convertToObject(evt.data);

      if (Array.isArray(data)) {
        data.forEach((data) => {
          this.onMessage(data);
        });
      } else if (data instanceof Object) {
        switch (data.op) {
          // 普通消息: 5
          case 5:
            this.onMessageReply(data.body);
            break;
        }
      }

      return this;
    },
    onMessageReply(data) {
      try {
        if (Array.isArray(data)) {
          data.forEach((data) => {
            this.onMessageReply(data);
          });
        } else if(data.cmd=="INTERACT_WORD"){
          // console.log(data);

        }else if (data.cmd == "DANMU_MSG") {
          //    console.log(
          //   "uid: " +
          //     data.info[2][0] +
          //     " 用户: " +
          //     data.info[2][1] +
          //     " \n内容: " +
          //     data.info[1]
          // );
          let chatContent = data.info[1];
          let stompClient = this.$store.getters.getStompClient;
          if (chatContent.startsWith("点歌qq")) {

            stompClient.send(
              "/music/pick",
              {},
              JSON.stringify({
                name: chatContent.slice(4).trim().replace(/\s+/,"+"),
                source: "qq",
                sendTime: Date.now(),
              })
            );
          } else if (chatContent.startsWith("点歌")) {
            console.log("点歌",data);
            stompClient.send(
              "/music/pick",
              {},
              JSON.stringify({
                name: chatContent.slice(2).trim(),
                source: "wy",
                sendTime: Date.now(),
              })
            );
          } else if(chatContent.startsWith("切歌")||chatContent.startsWith("投票切歌")){
                  // console.log("切",this.switchUsers)
                  this.$set(this.switchUsers, data.info[2][0], data.info[2][1]);

                  if( Object.keys(this.switchUsers).length > this.switchLimit){
                    stompClient.send("/music/skip/vote", {}, {});
                  }
          }
        }else{
                      // console.log(data);
                      // console.log(data.cmd == "DANMU_MSG",data.info[1]);
          }
      } catch (e) {
        console.error("On Message Resolve Error: ", e);
      }
    },

    getCertification(json) {
      var bytes = this.str2bytes(json); //字符串转bytes
      var n1 = new ArrayBuffer(bytes.length + 16);
      var i = new DataView(n1);
      i.setUint32(0, bytes.length + 16), //封包总大小
        i.setUint16(4, 16), //头部长度
        i.setUint16(6, 1), //协议版本
        i.setUint32(8, 7), //操作码 7表示认证并加入房间
        i.setUint32(12, 1); //就1
      for (var r = 0; r < bytes.length; r++) {
        i.setUint8(16 + r, bytes[r]); //把要认证的数据添加进去
      }
      return i; //返回
    },
    //字符串转bytes //这个方法是从网上找的QAQ
 str2bytes(str) {
  const bytes = [];
  let c;
  const len = str.length;
  for (let i = 0; i < len; i++) {
    c = str.charCodeAt(i);
    if (c >= 0x010000 && c <= 0x10ffff) {
      bytes.push(((c >> 18) & 0x07) | 0xf0);
      bytes.push(((c >> 12) & 0x3f) | 0x80);
      bytes.push(((c >> 6) & 0x3f) | 0x80);
      bytes.push((c & 0x3f) | 0x80);
    } else if (c >= 0x000800 && c <= 0x00ffff) {
      bytes.push(((c >> 12) & 0x0f) | 0xe0);
      bytes.push(((c >> 6) & 0x3f) | 0x80);
      bytes.push((c & 0x3f) | 0x80);
    } else if (c >= 0x000080 && c <= 0x0007ff) {
      bytes.push(((c >> 6) & 0x1f) | 0xc0);
      bytes.push((c & 0x3f) | 0x80);
    } else {
      bytes.push(c & 0xff);
    }
  }
  return bytes;
},
    disconnectBiliBili() {
      if (this.timer != null) clearInterval(this.timer);
      this.socket.close();
      this.connected = false;
      this.addMessage({ text: "已断开连接" });
    },
    addMessage(message) {
      message.time = new Date().toLocaleTimeString();
      this.messages.push(message);
    },
    convertToObject(buf) {
      // const nodeZlib = require('zlib');
      var decompress = require("brotli/decompress");
      const dataView = new DataView(buf);
      const data = {
        body: [],
      };

      data.packetLen = dataView.getInt32(0);
      const wsBinaryHeaderList = [
        {
          name: "Header Length",
          key: "headerLen",
          bytes: 2,
          offset: 4,
          value: 16,
        },
        {
          name: "Protocol Version",
          key: "ver",
          bytes: 2,
          offset: 6,
          value: 1,
        },
        {
          name: "Operation",
          key: "op",
          bytes: 4,
          offset: 8,
          value: 1,
        },
        {
          name: "Sequence Id",
          key: "seq",
          bytes: 4,
          offset: 12,
          value: 1,
        },
      ];
      wsBinaryHeaderList.forEach((head) => {
        if (head.bytes === 4) {
          data[head.key] = dataView.getInt32(head.offset);
        } else if (head.bytes === 2) {
          data[head.key] = dataView.getInt16(head.offset);
        }
      });

      let a = 0;
      let u = null;
      for (let i = 0, s = data.packetLen; i < buf.byteLength; i += s) {
        s = dataView.getInt32(i);
        a = dataView.getInt16(i + 4);
        try {
          if (data.ver === 0) {
            const c = new TextDecoder().decode(buf.slice(i + a, i + s));
            u = 0 !== c.length ? JSON.parse(c) : null;
          } else if (data.ver === 3) {
            const l = buf.slice(i + a, i + s);
            // console.log("解压前",l);
            // console.log("nodeZlib",nodeZlib);
            const h = decompress(new Uint8Array(l));
            // console.log("解压后",h);
            u = this.convertToObject(h.buffer).body;
          }
          u && data.body.push(u);
        } catch (err) {
          console.log("decode body error:", new Uint8Array(buf), data, err);
        }
      }

      return data;
    },
  },
};
</script>
