var fs=require("fs");
var mime=require("mime-types");
var URL=require('url');

var wss=require("./websocketserver.js").wss;

var MainServerPort = process.env.PORT || 8080;

var server=require('http').createServer(function(req,res){
	req.url=decodeURI(req.url);
	var rus=req.url.split("/");
	console.log("join to "+req.url);
	if(rus[rus.length-1]=="")
	{
		res.statusCode=200;
		res.setHeader('Content-Type',mime.lookup("./web"+req.url+"index.html")+";charset=UTF-8");
		filesend("./web"+req.url+"index.html",res,function()
		{
			res.statusCode=404;
			res.setHeader('Content-Type',"text/plain;charset=UTF-8");
			res.end("404 error\nnot found "+req.url);
		});
	}
	else
	{
		res.statusCode=200;
		res.setHeader('Content-Type',mime.lookup("./web"+req.url)+";charset=UTF-8");
		filesend("./web"+req.url,res,function()
		{
			res.statusCode=404;
			res.setHeader('Content-Type',"text/plain;charset=UTF-8");
			res.end("404 error\nnot found "+req.url);
		});
	}
});
server.on('upgrade',function upgrade(request,socket,head)
{
  const pathname=URL.parse(request.url).pathname;
  if(pathname==='/$socket')
  {
    wss.handleUpgrade(request,socket,head,function done(ws)
    {
      wss.emit('connection',ws,request);
    });
  }
  else
  {
    socket.destroy();
  }
});
server.listen(MainServerPort,function(){
	console.log("MainServerOpen:"+MainServerPort);
});

function filesend(file,res,onerror)
{
	fs.exists(file,function(exists)
	{
		if(exists)
		{
			var src=fs.createReadStream(file);
			src.pipe(res);
		}
		else
		{
			onerror();
		}
	});
}
