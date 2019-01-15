module.exports = {
    plugins:[
        require('autoprefixer')({
            //是否美化属性值
            cascade:true,
            //是否去掉不必要的前缀
            remove:true
        }),
        // require('cssnano')()
    ]
};