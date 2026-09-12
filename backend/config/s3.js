const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const bucket = process.env.AWS_S3_BUCKET_NAME;
const region = process.env.AWS_REGION || 'ap-south-1';

const s3 = new S3Client({ region });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      return cb(null, true);
    }
    return cb(new Error('Only PDF files are allowed.'), false);
  },
});

const sanitizeFilename = (filename) => {
  const originalName = path.basename(filename || 'document.pdf');
  const extension = path.extname(originalName).toLowerCase() === '.pdf' ? '.pdf' : '';
  const baseName = path.basename(originalName, path.extname(originalName))
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);

  return `${baseName || 'document'}${extension}`;
};

const assertConfigured = () => {
  if (!bucket) {
    throw new Error('S3 storage is not configured.');
  }
};

const uploadFile = async (file, userId) => {
  assertConfigured();

  const uniqueId = crypto.randomUUID();
  const key = `notes/${String(userId)}/${uniqueId}-${sanitizeFilename(file.originalname)}`;

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file.buffer,
    ContentType: 'application/pdf',
  }));

  return key;
};

const deleteFile = async (key) => {
  if (!key || key.startsWith('http://') || key.startsWith('https://')) return;
  assertConfigured();
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
};

const getAccessUrl = async (key, expiresIn = 900) => {
  if (!key || key.startsWith('http://') || key.startsWith('https://')) return key || null;
  assertConfigured();

  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn },
  );
};

const getDownloadUrl = async (key, expiresIn = 900) => {
  if (!key || key.startsWith('http://') || key.startsWith('https://')) return key || null;
  assertConfigured();

  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: 'attachment; filename="noteshub-note.pdf"',
      ResponseContentType: 'application/pdf',
    }),
    { expiresIn },
  );
};

const isS3Key = (value) => typeof value === 'string' && value.startsWith('notes/');

const getNoteStorageKey = (note) => {
  if (note?.storageKey && isS3Key(note.storageKey)) return note.storageKey;
  if (isS3Key(note?.fileUrl)) return note.fileUrl;
  return null;
};

const addFileAccessUrl = async (note) => {
  const noteObject = typeof note.toObject === 'function' ? note.toObject() : { ...note };
  const storageKey = getNoteStorageKey(noteObject);

  if (storageKey) {
    noteObject.fileUrl = await getAccessUrl(storageKey);
    noteObject.storageKey = storageKey;
    noteObject.thumbnailUrl = null;
  }

  return noteObject;
};

module.exports = {
  addFileAccessUrl,
  deleteFile,
  getAccessUrl,
  getDownloadUrl,
  getNoteStorageKey,
  isS3Key,
  upload,
  uploadFile,
};
