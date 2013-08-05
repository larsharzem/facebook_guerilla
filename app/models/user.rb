class User < ActiveRecord::Base
	attr_accessible :id, :threads, :friend_message_count, :passwords
	serialize :threads, JSON
	serialize :friend_message_count, JSON
	serialize :allowances, JSON
end
