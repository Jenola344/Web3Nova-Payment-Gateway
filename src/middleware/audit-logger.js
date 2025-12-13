const AuditLogModel = require('../models/audit-log-model');

const auditLogger = (action, entityType) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      if (res.statusCode < 400) {
        AuditLogModel.create({
          userId: req.user?.id,
          action,
          entityType,
          entityId: data.data?.id,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          requestMethod: req.method,
          requestPath: req.originalUrl,
          statusCode: res.statusCode,
          metadata: {
            body: req.body,
            query: req.query
          }
        }).catch(err => console.error('Audit log failed:', err));
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

module.exports = { auditLogger };
