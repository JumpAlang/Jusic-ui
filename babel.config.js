module.exports = {
  presets: [
    ['@vue/cli-plugin-babel/preset', {useBuiltIns: 'entry'}]
  ],
  "plugins": ["transform-object-rest-spread"] //不能解析es6语法关键解决

}
