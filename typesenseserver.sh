source ./.env    
#sudo rm -rf "$(pwd)"/typesense-data
mkdir "$(pwd)"/typesense-data

docker run -p 8108:8108 \
           --name typesense-server \
           --rm \
           -v"$(pwd)"/typesense-data:/data typesense/typesense:27.1 \
           --data-dir /data \
           --api-key=$TYPESENSE_APIKEY \
           --enable-cors



