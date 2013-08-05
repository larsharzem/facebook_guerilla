class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :id
      t.text :threads
			t.text :friend_message_count
			t.text :allowances

      t.timestamps
    end
  end
end
