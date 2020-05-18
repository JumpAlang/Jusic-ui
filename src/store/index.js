import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        socket: {
            socketClient: {},
            stompClient: {},
            stompHeaders: {},
            online: 0,
            isConnected: false,
            userName: localStorage.getItem("USER_NAME") ? localStorage.getItem("USER_NAME") : null,
            isRoot: false,
            isAdmin: false,
			good:false
        },
        player: {
            pick: [],
            music: {},
            lyrics: [],
            lyric: '',
            volume: localStorage.getItem('VOLUME') ? Number(localStorage.getItem('VOLUME')) : 10,
            progress: 0,
            time: '00:00 / 00:00',
			music2:{}
        },
        chat: {
            data: [],
            message: ''
        },
        search: {
            keyword: '',
            count: 0,
            data: [],
            picture: {
                keyword: '',
                count: 0,
                data: [],
            }
        }
    },
    getters: {
        getSocket: state => {
            return state.socket;
        },
        getPlayer: state => {
            return state.player;
        },
        getChat: state => {
            return state.chat;
        },
        getSocketClient: state => {
            return state.socket.socketClient;
        },
        getStompClient: state => {
            return state.socket.stompClient;
        },
        getStompHeaders: state => {
            return state.socket.stompHeaders;
        },
        getSocketOnline: state => {
            return Number(state.socket.online);
        },
        getIsConnected: state => {
            return Boolean(state.socket.isConnected);
        },
        getSocketUserName: state => {
            return String(state.socket.userName);
        },
        isSocketRoot: state => {
            return Boolean(state.socket.isRoot)
        },
        isSocketAdmin: state => {
            return Boolean(state.socket.isAdmin)
        },
		isSocketGood:state =>{
			return Boolean(state.socket.good)
		},
        getPlayerMusic: state => {
            return state.player.music;
        },
		getMusic2: state => {
            return state.player.music2;
        },
        getPlayerLyrics: state => {
            return state.player.lyrics;
        },
        getPlayerLyric: state => {
            return state.player.lyric;
        },
        getPlayerPick: state => {
            return state.player.pick;
        },
        getPlayerVolume: state => {
            return Number(state.player.volume);
        },
        getPlayerProgress: state => {
            return Number(state.player.progress);
        },
        getPlayerTime: state => {
            return String(state.player.time);
        },
        getChatData: state => {
            return state.chat.data;
        },
        getChatMessage: state => {
            return state.chat.message;
        },
        getSearchKeyword: state => {
            return state.search.keyword
        },
        getSearchData: state => {
            return state.search.data
        },
        getSearchCount: state => {
            return state.search.count
        },
        getSearchPictureKeyword: state => {
            return state.search.picture.keyword
        },
        getSearchPictureData: state => {
            return state.search.picture.data
        },
        getSearchPictureCount: state => {
            return state.search.picture.count
        }
    },
    mutations: {
        setSocketClient: (state, value) => {
            state.socket.socketClient = value
        },
        setStompClient: (state, value) => {
            state.socket.stompClient = value;
        },
        setStompHeaders: (state, value) => {
            state.socket.stompHeaders = value;
        },
        setSocketOnline: (state, value) => {
            state.socket.online = value;
        },
        setSocketIsConnected: (state, value) => {
            state.socket.isConnected = value;
        },
        setSocketUserName: (state, value) => {
            state.socket.userName = value;
            window.localStorage.setItem('USER_NAME', value);
        },
        setSocketRoot: (state, value) => {
            state.socket.isRoot = Boolean(value)
        },
        setSocketAdmin: (state, value) => {
            state.socket.isAdmin = Boolean(value)
        },
		setSocketGood: (state, value) => {
            state.socket.good = Boolean(value)
        },
        setPlayerMusic: (state, value) => {
            state.player.music = value;
        },
		setMusic2: (state, value) => {
            state.player.music2 = value;
        },
        setPlayerLyrics: (state, value) => {
            state.player.lyrics = value;
        },
        setPlayerLyric: (state, value) => {
            state.player.lyric = value;
        },
        setPlayerPick: (state, value) => {
            state.player.pick = value;
        },
        setPlayerVolume: (state, value) => {
            state.player.volume = value;
            window.localStorage.setItem('VOLUME', value);
        },
        setPlayerProgress: (state, value) => {
            state.player.progress = value;
        },
        setPlayerTime: (state, value) => {
            state.player.time = value;
        },
        pushChatData: (state, value) => {
            state.chat.data.push(value);
        },
        setChatMessage: (state, value) => {
            state.chat.message = value;
        },
        setSearchKeyword: (state, value) => {
            state.search.keyword = value
        },
        setSearchData: (state, value) => {
            state.search.data = value
        },
        setSearchCount: (state, value) => {
            state.search.count = value
        },
        setSearchPictureKeyword: (state, value) => {
            state.search.picture.keyword = value
        },
        setSearchPictureData: (state, value) => {
            state.search.picture.data = value
        },
        setSearchPictureCount: (state, value) => {
            state.search.picture.count = value
        }
    },
    actions: {},
    modules: {}
});
