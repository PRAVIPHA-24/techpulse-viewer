import boto3
import json
import os


S3_BUCKET = "techpulse-daily-editions-2026-pravipha"
S3_PREFIX = "editions/"


s3 = boto3.client("s3")


def lambda_handler(event, context):

    try:
        response = s3.list_objects_v2(
            Bucket=S3_BUCKET,
            Prefix=S3_PREFIX
        )

        objects = response.get("Contents", [])

        if not objects:
            return {
                "statusCode": 404,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "error": "No TECHPULSE editions found."
                })
            }

        latest = max(
            objects,
            key=lambda obj: obj["LastModified"]
        )

        latest_key = latest["Key"]

        file_response = s3.get_object(
            Bucket=S3_BUCKET,
            Key=latest_key
        )

        content = file_response["Body"].read().decode("utf-8")

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "text/plain; charset=utf-8",
                "Access-Control-Allow-Origin": "*"
            },
            "body": content
        }

    except Exception as e:

        print("ERROR:", str(e))

        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "error": str(e)
            })
        }