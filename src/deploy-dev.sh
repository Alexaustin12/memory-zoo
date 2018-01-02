zip -r ./memory-zoo-dev.zip *
aws s3 cp ./memory-zoo-dev.zip s3://memory-zoo/memory-zoo-dev.zip
aws lambda update-function-code --function-name memory-zoo-dev --s3-bucket memory-zoo --s3-key memory-zoo-dev.zip
export LAST_DEPLOY=$(date)
export LAST_DEPLOY_SECS=$(date +%s)
export LAST_DEPLOY_TIMESTAMP=$(expr $LAST_DEPLOY_SECS \* 1000)
echo "LAST_DEPLOY: $LAST_DEPLOY"
echo "LAST_DEPLOY_TIMESTAMP=$LAST_DEPLOY_TIMESTAMP"
rm memory-zoo-dev.zip
# aws logs filter-log-events --log-group-name /aws/lambda/memory-zoo-dev --start-time $LAST_DEPLOY_TIMESTAMP