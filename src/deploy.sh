zip -r ./memory-zoo.zip *
aws s3 cp ./memory-zoo.zip s3://memory-zoo/memory-zoo.zip
aws lambda update-function-code --function-name memory-zoo --s3-bucket memory-zoo --s3-key memory-zoo.zip
export LAST_DEPLOY=$(date)
export LAST_DEPLOY_SECS=$(date +%s)
export LAST_DEPLOY_TIMESTAMP=$(expr $LAST_DEPLOY_SECS \* 1000)
echo "LAST_DEPLOY: $LAST_DEPLOY"
echo "LAST_DEPLOY_TIMESTAMP=$LAST_DEPLOY_TIMESTAMP"
rm memory-zoo.zip
# aws logs filter-log-events --log-group-name /aws/lambda/memory-zoo --start-time $LAST_DEPLOY_TIMESTAMP