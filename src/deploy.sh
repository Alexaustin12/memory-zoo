zip -r ./memory-zoo.zip *
aws s3 cp ./memory-zoo.zip s3://memory-zoo/memory-zoo.zip
aws lambda update-function-code --function-name memory-zoo --s3-bucket memory-zoo --s3-key memory-zoo.zip
export LAST_DEPLOY_SECS=$(date +%s)
export LAST_DEPLOY=$(expr $LAST_DEPLOY_SECS \* 1000)
echo 'Deploy time '$LAST_DEPLOY' - stored in LAST_DEPLOY'
# aws logs filter-log-events --log-group-name /aws/lambda/memory-zoo --start-time $LAST_DEPLOY