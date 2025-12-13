/**
 * AWS Configuration
 * AWS services configuration (SES, S3)
 */

const AWS = require('aws-sdk');
const config = require('./env-config');
const logger = require('./logger-config');

// Configure AWS SDK
AWS.config.update({
  region: config.aws.region,
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey
});

// SES Configuration
const ses = new AWS.SES({
  apiVersion: '2010-12-01',
  region: config.aws.region
});

// S3 Configuration
const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  region: config.aws.region,
  signatureVersion: 'v4'
});

/**
 * Send email via AWS SES
 * @param {Object} params - Email parameters
 * @returns {Promise<Object>}
 */
const sendEmail = async (params) => {
    const {
        to,
        subject,
        htmlBody,
        textBody,
        from = config.aws.sesFromEmail,
        replyTo = config.email.replyTo
    } = params;
    
    const emailParams = {
        Source: from,
        Destination: {
        ToAddresses: Array.isArray(to) ? to : [to]
        },
        Message: {
        Subject: {
            Data: subject,
            Charset: 'UTF-8'
        },
        Body: {
            Html: {
            Data: htmlBody,
            Charset: 'UTF-8'
            },
            Text: {
            Data: textBody || htmlBody.replace(/<[^>]*>/g, ''),
            Charset: 'UTF-8'
            }
        }
        },
        ReplyToAddresses: [replyTo]
    };
    
    try {
        const result = await ses.sendEmail(emailParams).promise();
        
        logger.info('Email sent successfully via SES', {
        to,
        subject,
        messageId: result.MessageId
        });
        
        return {
        success: true,
        messageId: result.MessageId
        };
    } catch (error) {
        logger.error('Failed to send email via SES', {
        to,
        subject,
        error: error.message,
        stack: error.stack
        });
        throw error;
    }
};

/**
 * Send templated email via AWS SES
 * @param {Object} params - Email parameters
 * @returns {Promise<Object>}
 */
const sendTemplatedEmail = async (params) => {
    const {
        to,
        templateName,
        templateData,
        from = config.aws.sesFromEmail
    } = params;
    
    const emailParams = {
        Source: from,
        Destination: {
        ToAddresses: Array.isArray(to) ? to : [to]
        },
        Template: templateName,
        TemplateData: JSON.stringify(templateData)
    };
    
    try {
        const result = await ses.sendTemplatedEmail(emailParams).promise();
        
        logger.info('Templated email sent successfully via SES', {
        to,
        templateName,
        messageId: result.MessageId
        });
        
        return {
        success: true,
        messageId: result.MessageId
        };
    } catch (error) {
        logger.error('Failed to send templated email via SES', {
        to,
        templateName,
        error: error.message
        });
        throw error;
    }
};

/**
 * Upload file to S3
 * @param {Object} params - Upload parameters
 * @returns {Promise<Object>}
 */
const uploadToS3 = async (params) => {
  const {
    key,
    body,
    contentType,
    bucket = config.aws.s3Bucket,
    acl = 'private',
    metadata = {}
  } = params;
  
  const uploadParams = {
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: acl,
    Metadata: metadata
  };
  
  try {
    const result = await s3.upload(uploadParams).promise();
    
    logger.info('File uploaded to S3 successfully', {
      bucket,
      key,
      location: result.Location
    });
    
    return {
      success: true,
      location: result.Location,
      key: result.Key,
      bucket: result.Bucket,
      etag: result.ETag
    };
  } catch (error) {
    logger.error('Failed to upload file to S3', {
      bucket,
      key,
      error: error.message
    });
    throw error;
  }
};

/**
 * Get file from S3
 * @param {string} key - S3 object key
 * @param {string} bucket - S3 bucket name
 * @returns {Promise<Buffer>}
 */
const getFromS3 = async (key, bucket = config.aws.s3Bucket) => {
  const params = {
    Bucket: bucket,
    Key: key
  };
  
  try {
    const result = await s3.getObject(params).promise();
    
    logger.info('File retrieved from S3', { bucket, key });
    
    return result.Body;
  } catch (error) {
    logger.error('Failed to get file from S3', {
      bucket,
      key,
      error: error.message
    });
    throw error;
  }
};

/**
 * Delete file from S3
 * @param {string} key - S3 object key
 * @param {string} bucket - S3 bucket name
 * @returns {Promise<Object>}
 */
const deleteFromS3 = async (key, bucket = config.aws.s3Bucket) => {
  const params = {
    Bucket: bucket,
    Key: key
  };
  
  try {
    await s3.deleteObject(params).promise();
    
    logger.info('File deleted from S3', { bucket, key });
    
    return { success: true };
  } catch (error) {
    logger.error('Failed to delete file from S3', {
      bucket,
      key,
      error: error.message
    });
    throw error;
  }
};

/**
 * Generate presigned URL for S3 object
 * @param {string} key - S3 object key
 * @param {number} expiresIn - Expiration time in seconds (default: 3600)
 * @param {string} bucket - S3 bucket name
 * @returns {string}
 */
const getPresignedUrl = (key, expiresIn = 3600, bucket = config.aws.s3Bucket) => {
  const params = {
    Bucket: bucket,
    Key: key,
    Expires: expiresIn
  };
  
  try {
    const url = s3.getSignedUrl('getObject', params);
    
    logger.info('Generated presigned URL', {
      bucket,
      key,
      expiresIn
    });
    
    return url;
  } catch (error) {
    logger.error('Failed to generate presigned URL', {
      bucket,
      key,
      error: error.message
    });
    throw error;
  }
};

/**
 * Check if S3 object exists
 * @param {string} key - S3 object key
 * @param {string} bucket - S3 bucket name
 * @returns {Promise<boolean>}
 */
const objectExists = async (key, bucket = config.aws.s3Bucket) => {
  const params = {
    Bucket: bucket,
    Key: key
  };
  
  try {
    await s3.headObject(params).promise();
    return true;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    logger.error('Error checking S3 object existence', {
      bucket,
      key,
      error: error.message
    });
    throw error;
  }
};

/**
 * List objects in S3 bucket with prefix
 * @param {string} prefix - Object key prefix
 * @param {string} bucket - S3 bucket name
 * @returns {Promise<Array>}
 */
const listObjects = async (prefix, bucket = config.aws.s3Bucket) => {
  const params = {
    Bucket: bucket,
    Prefix: prefix
  };
  
  try {
    const result = await s3.listObjectsV2(params).promise();
    
    return result.Contents || [];
  } catch (error) {
    logger.error('Failed to list S3 objects', {
      bucket,
      prefix,
      error: error.message
    });
    throw error;
  }
};

/**
 * Verify SES email address
 * @param {string} email - Email address to verify
 * @returns {Promise<Object>}
 */
const verifySESEmail = async (email) => {
  const params = {
    EmailAddress: email
  };
  
  try {
    await ses.verifyEmailIdentity(params).promise();
    
    logger.info('SES email verification initiated', { email });
    
    return { success: true };
  } catch (error) {
    logger.error('Failed to verify SES email', {
      email,
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  ses,
  s3,
  sendEmail,
  sendTemplatedEmail,
  uploadToS3,
  getFromS3,
  deleteFromS3,
  getPresignedUrl,
  objectExists,
  listObjects,
  verifySESEmail
};