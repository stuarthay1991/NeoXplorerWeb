/** Cancer Type dropdown eventKeys (NavBarDropdown) — keep in sync with server cancerTypes.js */

export const NEO_SET_CANCER_TYPE_EVENT = 'neo-set-cancer-type';
export const NEO_SET_CANCER_SIGNATURE_GROUP_EVENT = 'neo-set-cancer-signature-group';

export const CANCER_TYPE_EVENT_KEYS = [
  'BLCA',
  'BRCA',
  'CESC',
  'COAD',
  'ESCA',
  'GBM',
  'GTEX',
  'HNSC',
  'KICH',
  'KIRC',
  'LGG',
  'LIHC',
  'LUAD',
  'LUSC',
  'OV',
  'PAAD',
  'PCPG',
  'PRAD',
  'READ',
  'SARC',
  'SKCM',
  'STAD',
  'TGCT',
  'THCA',
  'UCEC',
];

export const cancerDisplayNames = {
  BLCA: 'Bladder Cancer (TCGA)',
  BRCA: 'Breast Cancer (TCGA)',
  CESC: 'Cervical Squamous Cell Carcinoma (TCGA)',
  COAD: 'Colon Cancer (TCGA)',
  ESCA: 'Esophageal Cancer (TCGA)',
  GBM: 'Glioblastoma (TCGA)',
  GTEX: 'GTEX',
  HNSC: 'Head and Neck Cancer (TCGA)',
  KICH: 'Kidney Chromophobe (TCGA)',
  KIRC: 'Kidney Renal Clear Cell Carcinoma (TCGA)',
  LGG: 'Low-Grade Gliomas (TCGA)',
  LIHC: 'Liver Cancer (TCGA)',
  LUAD: 'Lung Cancer (TCGA)',
  LUSC: 'Lung Squamous Cell Carcinoma (TCGA)',
  OV: 'Ovarian Cancer (TCGA)',
  PAAD: 'Pancreatic Cancer (TCGA)',
  PCPG: 'Pheochromocytoma and paraganglioma (TCGA)',
  PRAD: 'Primary Prostate Cancer (TCGA)',
  READ: 'Rectal Cancer (TCGA)',
  SARC: 'Bone and Connective Tissue Cancer (TCGA)',
  SKCM: 'Skin Cancer (TCGA)',
  STAD: 'Stomach Adenocarcinoma (TCGA)',
  TGCT: 'Tenosynovial Giant Cell Tumors (TCGA)',
  THCA: 'Thyroid Carcinoma (TCGA)',
  UCEC: 'Uterine Serous Cancer (TCGA)',
};

export function isValidCancerTypeCode(code) {
  return typeof code === 'string' && CANCER_TYPE_EVENT_KEYS.includes(code);
}

export function dispatchCancerTypeSelection(cancerType) {
  if (!isValidCancerTypeCode(cancerType)) {
    return false;
  }
  window.dispatchEvent(
    new CustomEvent(NEO_SET_CANCER_TYPE_EVENT, { detail: { cancerType } }),
  );
  return true;
}

/** @returns {{ cancerType?: string; cancerSignatureGroup?: string; genes?: string[] }} */
export function getNeoNavBarContext() {
  return window.neoNavBarContext ?? {};
}

export function dispatchCancerSignatureGroupSelection(cancerSignatureGroup) {
  if (!isValidCancerTypeCode(cancerSignatureGroup)) {
    return false;
  }
  window.dispatchEvent(
    new CustomEvent(NEO_SET_CANCER_SIGNATURE_GROUP_EVENT, {
      detail: { cancerSignatureGroup },
    }),
  );
  return true;
}
