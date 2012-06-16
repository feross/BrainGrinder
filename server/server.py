#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import argparse
import re
import json
import io
import base64
import tornado.database
import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.auth
import bcrypt
import urllib2
import hashlib

from datetime import datetime
from optparse import OptionParser
from tornado.options import define, options

class Application(tornado.web.Application):
    """Custom application class that keeps a database connection"""
    
    def __init__(self):
        handlers = [
            (r"/tts/[0-9a-f]+.mp3$", TTSHandler),
            (r".*", ErrorHandler),
        ]
        settings = dict(
            debug=True, # always refresh templates
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            xsrf_cookies=True,
            cookie_secret="O4njCZbs7FEyYE4ifo5tf8lSSHmgT6o", # we don't use cookies for anything
        )
        tornado.web.Application.__init__(self, handlers, **settings)
    
class HandlerBase(tornado.web.RequestHandler):
   
    def get_error_html(self, status_code, **kwargs):
        """Renders error pages (called internally by Tornado)"""
        if status_code == 404:
            try:
                return open('static/404.html', 'r').read()
            except Exception:
                pass
                
        return super(HandlerBase, self).get_error_html(status_code, **kwargs)

class TTSHandler(HandlerBase):
    q = None
    tl = None
    
    @tornado.web.asynchronous
    def get(self):
        self.q = self.get_argument("q")
        self.tl = self.get_argument("tl")
        self.set_header("Content-Type", "audio/mpeg")
        
        q_encoded = urllib2.quote(self.q.encode("utf-8"))
        tl_encoded = urllib2.quote(self.tl.encode("utf-8"))
        url = "http://translate.google.com/translate_tts?q="+q_encoded+"&tl="+tl_encoded
        http = tornado.httpclient.AsyncHTTPClient()
        http.fetch(url, callback=self.on_response)

    def on_response(self, response):
        if response.error: raise tornado.web.HTTPError(500)
        filename = hashlib.sha1(self.q.encode('utf-8')+'####'+self.tl.encode('utf-8')).hexdigest()

        fileObj = open(os.path.join(os.path.dirname(__file__), "../static/tts/"+filename+".mp3"), "w")
        fileObj.write(response.body)
        fileObj.close()

        self.write(response.body)
        self.finish()
        
class ErrorHandler(HandlerBase):
    def prepare(self):
        self.send_error(404)    
        
def main():
	# Parse command line args
    parser = argparse.ArgumentParser(description='The BrainGrinder Tornado server')
    parser.add_argument("--port", default=7500, help="run on the given port", type=int)
    cli_args = parser.parse_args()
    
    http_server = tornado.httpserver.HTTPServer(Application(), xheaders=True)
    http_server.listen(cli_args.port)

    # Start the main loop
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":    
    main()
