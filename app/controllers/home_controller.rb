class HomeController < ApplicationController
	#require "sinatra"
	require 'koala'
	require 'json'
	
	# enable :sessions
	# set :raise_errors, false
	# set :show_exceptions, false

	def index
	end
	
	def create
		render :index
	end

	# def logout
	  # session[:access_token] = nil
	  # redirect '/'
	# end
	
	def get_user
		user = User.find(:first, :conditions => { :id => params['user_id'] })
		if user.nil?
			render :json => {:message => "error, no user for id #{params['user_id']} or wrong or empty password", :status => 404}, :status => :ok, :content_type => "application/json", :callback => params['callback']
		else
			render :json => {:data => user.to_json, :status => 200}, :content_type => "application/json", :callback => params['callback']
		end
	end
	
	#TODO auth behaviour
	def new_user(user_id = nil)
		user_id = user_id || params['user_id']
		user = User.find(:first, :conditions => { :id => user_id })
		
		user.destroy if user.present?
		
		if user.blank?
			user = User.new
			user.id = params['id']
			user.threads = {}
			user.friend_message_count = {}
			user.allowances = {}
		end
		
		if params.blank?
			user.save
		else
			if user.save
				render :json => {:message => "saved", :status => 200}, :status => :ok, :content_type => "application/json"
			else
				render :json => {:message => "error, could not save user", :status => 404}, :status => :ok, :content_type => "application/json"
			end
		end
	end
	
	def get_friend_message_count
		user = User.find(:first, :conditions => { :id => params['user_id'] })
		
		if user.present?
			# puts "allow: #{user.allowances[params['pass']]}"
			# puts "compare: #{Time.parse(user.allowances[params['pass']] || Time.now.to_s) >= Time.now}"
			if user.allowances[params['pass']].present? && Time.parse(user.allowances[params['pass']]) >= Time.now
				friend_count = user.friend_message_count || {}
				render :json => {:data => friend_count, :status => 200}, :content_type => "application/json", :callback => params['callback']
			else
				render :json => {:message => "error, not authorized for user id #{params['user_id']}", :status => 401}, :status => :ok, :content_type => "application/json", :callback => params['callback']
			end
		else
			render :json => {:message => "error, no user for id #{params['user_id']}", :status => 404}, :status => :ok, :content_type => "application/json", :callback => params['callback']
		end
	end
	
	def get_single_friend_message_count
		user = User.find(:first, :conditions => { :id => params['user_id'] })
		
		if user.present?
			friend_count = user.friend_message_count[params['friend_id']] || 0
			render :json => {:data => friend_count, :status => 200}, :content_type => "application/json", :callback => params['callback']
		else
			render :json => {:message => "error, no user for id #{params['user_id']} or wrong or empty password", :status => 404}, :status => :ok, :content_type => "application/json", :callback => params['callback']
		end
	end
	
	#TODO auth behaviour
	def post_thread_data
		user = User.find(params['user_id'])
		if user.blank?
			new_user(params['user_id'])
		end
		
		user.threads = params['threads']
		if user.save
			render :json => {:message => "saved  all threads", :status => 200}, :status => :ok, :content_type => "application/json"
		else
			render :json => {:message => "could not save full thread data for user #{params['user_id']}", :status => 500}, :status => 500, :content_type => "application/json"
		end
	end
	
	def post_single_thread
		user_id = params['user_id']
		thread_id = params['thread_id']
		
		user = User.find(:first, :conditions => { :id => user_id })
		puts "user present: #{user.present?}"
			
		if user.blank?
			new_user(user_id)
		end
		
		if params['thread_id'].blank? && params['data'].blank?
			render :json => {:message => "no user id given or no thread-id given for user: #{params['user_id']} or thread data empty: #{params['data'].blank?}", :status => 404}, :status => 404
		else
			
			# puts "new data class: #{(params['data'].as_json).class}"
			user.threads[thread_id] = params['data'].as_json
			
			user.threads[thread_id]['fullThread'].each do |msg|
				if msg['from']['id'].to_s != user.id.to_s # count add messages from yourself here
					# inc_friend_message_count(msg['from']['id'])
					if user.friend_message_count[msg['from']['id']].blank?
						user.friend_message_count[msg['from']['id']] = 1
					else
						user.friend_message_count[msg['from']['id']] += 1
					end
				else
					user.threads[thread_id]['participants']['data'].each do |receiver|
						if receiver['id'].to_s != user.id.to_s
							if user.friend_message_count[receiver['id']].blank?
								user.friend_message_count[receiver['id']] = 1
							else
								user.friend_message_count[receiver['id']] += 1
							end
						end
					end
				end
			end
			
			#puts user.friend_message_count
			
			if user.save
				render :json => {:message => "saved", :status => 200}, :status => :ok, :content_type => "application/json"
			else
				render :json => {:message => "could not save thread #{thread_id} for user #{user_id}", :status => 500}, :status => 500
			end
		end
	end
	
	def inc_friend_message_count(user, friend_id)
		if user.friend_message_count[friend_id].blank?
			user.friend_message_count[friend_id] = 1
		else
			user.friend_message_count[friend_id] += 1
		end
	end
	
	def build_new_message_count
		user_id = params['user_id']
		user = User.find(:first, :conditions => { :id => user_id })
		puts "user present: #{user.present?}"
		
		user.friend_message_count = {}
		
		user.threads.each do |key, thread|
			# puts "id: #{key}"
			# puts "value: #{thread}"
			
			thread['fullThread'].each do |msg|
				if msg['from']['id'].to_s != user.id.to_s # count add messages from yourself here
					# inc_friend_message_count(msg['from']['id'])
					if user.friend_message_count[msg['from']['id']].blank?
						user.friend_message_count[msg['from']['id']] = 1
					else
						user.friend_message_count[msg['from']['id']] += 1
					end
				else
					thread['participants']['data'].each do |receiver|
						if receiver['id'].to_s != user.id.to_s
							if user.friend_message_count[receiver['id']].blank?
								user.friend_message_count[receiver['id']] = 1
							else
								user.friend_message_count[receiver['id']] += 1
							end
						end
					end
				end
			end
		end
		
		if user.save
			render :json => {:message => "saved", :status => 200}, :status => :ok, :content_type => "application/json"
		else
			render :json => {:message => "could not save thread #{thread_id} for user #{user_id}", :status => 500}, :status => 500
		end
	end
	
	def get_single_thread_updated_time
		user_id = params['user_id']
		thread_id = params['thread_id']
		user = User.find(:first, :conditions => { :id => user_id })
		
		if user.blank?
			render :json => {:message => "error, no user for id #{params['user_id']}", :status => 404}, :status => :ok, :content_type => "application/json", :callback => params['callback']
		elsif user.threads[thread_id].blank? || user.threads[thread_id]['updated_time'].blank?
			render :json => {:updated_time => Time.at(0), :status => 200}, :status => :ok, :content_type => "application/json", :callback => params['callback'] # no thread so far, send an old date
		else
			render :json => {:updated_time => user.threads[thread_id]['updated_time'], :status => 200}, :status => :ok, :content_type => "application/json", :callback => params['callback']
		end
	end
	
	def get_single_thread
		user = User.find(:first, :conditions => { :id => params['user_id'] })
		if user.present?
			if user.allowances[params['pass']].present? && Time.parse(user.allowances[params['pass']]) >= Time.now
			render :json => {:data => user.threads[params['thread_id']], :status => 200}, :content_type => "application/json", :callback => params['callback']
			else
				render :json => {:message => "error, not authorized for user id #{params['user_id']}", :status => 401}, :status => :ok, :content_type => "application/json", :callback => params['callback']
			end
		else
			render :json => {:message => "error, no user for id #{params['user_id']}", :status => 404}, :status => :ok, :content_type => "application/json", :callback => params['callback']
		end
	end
	
	def get_all_threads
		user = User.find(:first, :conditions => { :id => params['user_id'] })
		if user.present?
			if user.allowances[params['pass']].present? && Time.parse(user.allowances[params['pass']]) >= Time.now
				render :json => {:data => user.threads, :status => 200}, :content_type => "application/json", :callback => params['callback']
			else
				render :json => {:message => "error, not authorized for user id #{params['user_id']}", :status => 401}, :status => :ok, :content_type => "application/json", :callback => params['callback']
			end
		else
			render :json => {:message => "error, no user for id #{params['user_id']}", :status => 404}, :status => :ok, :content_type => "application/json", :callback => params['callback']
		end
	end
	
	def terms
	end
	
	def privacy
	end
	
	def get_temporary_allowance
		if params.blank? || params['pass'].blank? || params['user_id'].blank?
			render :json => {:message => "error, no password given", :status => 404}, :status => :ok, :content_type => "application/json", :callback => params['callback']
		else
			@pass = params['pass']
			@user_id = params['user_id']
		end
	end
	
	def post_access_token
		if params['access_token'].present?
			graph = Koala::Facebook::GraphAPI.new(params['access_token'])
			# puts graph
			if graph
				fb_user = graph.get_object("me")
				if fb_user && fb_user['id'] == params['user_id']
					user = User.find(:first, :conditions => { :id => fb_user['id'] })
					
					# clean up
					now = Time.new
					user.allowances.each do |key, value|
						if now > Time.parse(value)
							puts "deleting value: #{Time.parse(value)}"
							user.allowances.delete(key)
						end
					end
					user.allowances[params['pass']] = now + 60 * 60
					# puts "allowances: #{user.allowances}"
					
					if user.save
						render :json => {:message => "everything alright", :status => 200}, :status => :ok, :content_type => "application/json"
					else
						render :json => {:message => "error, could not save user", :status => 404}, :status => :ok, :content_type => "application/json", :callback => params['callback']
					end
				else
					render :json => {:message => "error, wrong access token for that user id", :status => 404}, :status => :ok, :content_type => "application/json", :callback => params['callback']
				end
			else
				render :json => {:message => "error, wrong access token", :status => 404}, :status => :ok, :content_type => "application/json", :callback => params['callback']
			end
		else
			render :json => {:message => "error, no access token", :status => 404}, :status => :ok, :content_type => "application/json", :callback => params['callback']
		end
	end
end