module.exports = {
    plugins:[
        require('autoprefixer')({
            browsers:[
                "last 3 versions","iOS 7","not ie <= 7",
                "Android >= 4.0",
                "last 3 and_chr versions",
                "last 3 and_ff versions",
                "last 3 op_mob versions",
                "last 3 op_mob versions",
                "last 3 op_mini versions"
            ],
            //是否美化属性值
            cascade:true,
            //是否去掉不必要的前缀
            remove:true
        }),
        // require('cssnano')()
    ]
};