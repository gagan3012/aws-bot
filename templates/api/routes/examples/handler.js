var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var s3=new aws.S3()

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
   
    return s3.listObjects({
        Bucket:event.bucket,
        Prefix:event.prefix,
        MaxKeys:event.perpage || 100,
        Marker:event.token || null
    }).promise()
    .then(x=>{
        console.log("s3 response:",JSON.stringify(x,null,2))
        var examples=x.Contents.reduce(function(accum,value){
            var key=value.Key.split('/').pop().split('.')
            var ext=key.length >1 ? key.pop() : 'txt'
            key=key[0]
            var href=`${event.root}/examples/${key}.${ext}`
            if(!accum[key]){
                accum[key]={id:key}
            }
            if(ext==='json'){
                accum[key].document={href}
            }else{
                accum[key].description={href}
            }
            return accum
        },[])
        
        callback(null,{
            token:x.NextMarker,
            examples:Object.keys(examples).map(x=>examples[x])
        })
    })
    .catch(callback)
}


