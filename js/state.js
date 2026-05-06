/* 전역 상태 */
let API_BASE = window.location.origin.startsWith('http')
  ? window.location.origin
  : 'http://localhost:8000';
let isStreaming = false;
let previewMd  = '';
let previewImages = [];
let userInfo   = {};
