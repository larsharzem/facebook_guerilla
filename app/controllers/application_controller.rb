class ApplicationController < ActionController::Base
  #protect_from_forgery
	
	# before do
		# # HTTPS redirect
		# if request.scheme != 'https'
			# redirect "https://#{request.env['HTTP_HOST']}"
		# end
	# end

	# Scope defines what permissions that we are asking the user to grant.
	# In this example, we are asking for the ability to publish stories
	# about using the app, access to what the user likes, and to be able
	# to use their pictures.  You should rewrite this scope with whatever
	# permissions your app needs.
	# See https://developers.facebook.com/docs/reference/api/permissions/
	# for a full list of permissions
	@FACEBOOK_SCOPE = 'user_likes,user_photos,user_photo_video_tags,read_stream,read_mailbox'
  
  #before_filter :parse_facebook_cookies
	def parse_facebook_cookies
		@koala = Koala::Facebook::OAuth.new
		
		begin
			
			if params['code'].present? #if the actually called url is facebook_callback
				access_token = @koala.get_access_token(params['code'])
				session[:access_token] = access_token
				puts "got access token from params: #{access_token}"
			elsif session['access_token'].present?
				access_token = session['access_token']
			else
				facebook_cookies ||= @koala.get_user_info_from_cookie(cookies)
				if facebook_cookies.present?
					access_token = facebook_cookies["access_token"]
				end
			end
			if access_token.nil?
				redirect_to @koala.url_for_oauth_code(:permissions => @FACEBOOK_SCOPE)
			end
			
		rescue Koala::Facebook::OAuthTokenRequestError => err
			puts "got error: #{err.message}"
			redirect_to @koala.url_for_oauth_code(:permissions => @FACEBOOK_SCOPE)
		end
		
		begin
			@graph = Koala::Facebook::GraphAPI.new(access_token)
			if @graph
				#@app = @graph.get_object(ENV["FACEBOOK_APP_ID"])
			else
				redirect_to @koala.url_for_oauth_code(:permissions => @FACEBOOK_SCOPE)
			end
		rescue Koala::Facebook::OAuthTokenRequestError => err
			puts "error: #{err.message}"
			redirect_to @koala.url_for_oauth_code(:permissions => @FACEBOOK_SCOPE)
		end
	end
		
end