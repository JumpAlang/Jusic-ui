<template>
  <div class="lyrics-container" ref="container">
    <div
      class="lyrics-line"
      v-for="(value, key) in lyrics"
      :key="key"
      :class="{ 'lyrics-active': activeLine == key }"
    >
      {{ value }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    lyrics: {
      type: Object,
      required: true,
    },
    currentTime: {
      type: Number,
      required: true,
    },
    lineHeight: {
      type: Number,
      default: 30,
    },
  },
  data(){
    return {lastNumber : 0}
  },
  computed: {
    activeLine() {
      const { lyrics, currentTime } = this;
      const lastIndex = lyrics.length - 1;

      // 如果 currentTime 大于最后一行的时间，激活最后一行
    //   if (currentTime >= lyrics[lastIndex].time) {
    //     return lastIndex;
    //   }

      // 查找当前时间所在的行
      if (lyrics.length === 0) {
        
      } else {
        let number = Number(currentTime.toFixed());
        if (lyrics[number] !== undefined && lyrics[number] !== "") {
            this.lastNumber = number;
            return number;
        }else{
            return this.lastNumber;
        }
         
      }

      return 0;
    }
  },
  watch: {
    activeLine(val) {
      if (val !== -1) {
        this.$nextTick(() => {
          this.scrollToActiveLine();
        });
      }
    },
  },
  methods: {
    scrollToActiveLine() {
      const { activeLine, lineHeight } = this;
      const container = this.$refs.container;
      const lineEl = this.$el.querySelector('.lyrics-active');
    //   console.log(lineEl);
    //   console.log("c",this.$el);

      if (lineEl && container) {
        const offsetTop = lineEl.offsetTop;
        const containerTop = container.offsetTop;
        container.scrollTop = offsetTop - containerTop - lineHeight * 3;
      }
    },
  },
};
</script>

<style>
.lyrics-container {
  height: 100%;
  overflow-y: auto;
}

.lyrics-line {
  font-size: 16px;
  margin-bottom: 10px;
  text-align: center;
  white-space: pre-wrap;
}

.lyrics-active {
  color: #009688;
  font-weight: bold;
}
</style>