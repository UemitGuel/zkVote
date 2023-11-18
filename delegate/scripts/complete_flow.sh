url="localhost"

echo "Deleting poll";
curl -X POST "http://${url}:3000/delete_poll";

# Get status at the beginning (should be None)
curl "http://${url}:3000/vote_status/0x1234567";

echo "\nCreating poll\n";
curl -X POST \
     -H 'Content-Type: application/json' \
     -d '{"question":"Is this a bull market?"}' \
     http://localhost:3000/create_poll;
echo "\n";

sleep 1;

echo "\nGetting status after creating poll\n";
curl "http://${url}:3000/vote_status/0x1234567";
echo "\n";

sleep 1;

echo "\nRegistering voter\n";
curl -X POST \
     -H 'Content-Type: application/json' \
     -d '{"user_address":"0x1234567", "signed_hash":"0xabc"}' \
     http://localhost:3000/register_voter;
echo "\n";

sleep 1;

echo "\nGetting status after registration\n";
curl "http://${url}:3000/vote_status/0x1234567";

sleep 1;

echo "\nSetting Stage to Voting\n";
curl -X POST \
     -H 'Content-Type: application/json' \
     -d '{"stage":"Voting"}' \
     http://localhost:3000/set_stage
echo "\n";

sleep 1;
echo "\nGetting status after voting started\n";
curl "http://${url}:3000/vote_status/0x1234567";

sleep 1;
echo "\nVoting\n";
curl -X POST \
     -H 'Content-Type: application/json' \
     -d '{"user_address":"0x1234567", "signed_hash":"0xabc", "vote":"Yes", "id":"0"}' \
     http://localhost:3000/cast_vote;
echo "\n";

sleep 1;
echo "\nGetting status after having voted\n";
curl "http://${url}:3000/vote_status/0x1234567";

sleep 1;
echo "\nSetting Stage to Ended\n";
curl -X POST \
     -H 'Content-Type: application/json' \
     -d '{"stage":"Ended"}' \
     http://localhost:3000/set_stage
echo "\n";
sleep 1;

echo "\nGetting status at the end\n";
curl "http://${url}:3000/vote_status/0x1234567";

sleep 1;
