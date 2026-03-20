'use client';

import { useState, useRef } from 'react';

import {
  X,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  RefreshCw,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { IMPORTABLE_FIELDS, REQUIRED_FIELDS, type ImportableField } from '@/services/import';

type Props = {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
};

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

type PreviewRow = {
  rowNumber: number;
  data: Record<string, any>;
};

type ColumnMapping = {
  [csvColumn: string]: ImportableField | null;
};

type ValidationResult = {
  stats: {
    total: number;
    valid: number;
    invalid: number;
    warnings: number;
  };
  validRows: {
    rowNumber: number;
    sku: string;
    nameEn: string;
    action: 'create' | 'update';
    warnings: string[];
  }[];
  invalidRows: {
    rowNumber: number;
    sku?: string;
    errors: string[];
  }[];
  createCount: number;
  updateCount: number;
};

type ImportResult = {
  created: number;
  updated: number;
  failed: number;
  errors: { rowNumber: number; sku?: string; error: string }[];
  total: number;
};

export function ProductImportModal({ isOpen, onClose }: Props) {
  const t = useTranslations('admin.products.import');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File data
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);

  // Validation data
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Import result
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const resetState = () => {
    setStep('upload');
    setLoading(false);
    setError(null);
    setFile(null);
    setHeaders([]);
    setMapping({});
    setPreviewRows([]);
    setTotalRows(0);
    setValidationResult(null);
    setImportResult(null);
  };

  const handleClose = (refresh?: boolean) => {
    resetState();
    onClose(refresh);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse file');
      }

      setHeaders(data.data.headers);
      setMapping(data.data.suggestedMapping);
      setPreviewRows(data.data.previewRows);
      setTotalRows(data.data.totalRows);
      setStep('mapping');
    } catch (err: any) {
      setError(err.message || 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (csvColumn: string, field: ImportableField | '') => {
    setMapping((prev) => ({
      ...prev,
      [csvColumn]: field || null,
    }));
  };

  const handleValidate = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mapping', JSON.stringify(mapping));
      formData.append('mode', 'validate');

      const response = await fetch('/api/admin/products/import', {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Validation failed');
      }

      setValidationResult(data.data);
      setStep('preview');
    } catch (err: any) {
      setError(err.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setStep('importing');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mapping', JSON.stringify(mapping));
      formData.append('mode', 'import');

      const response = await fetch('/api/admin/products/import', {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Import failed');
      }

      setImportResult(data.data);
      setStep('complete');
    } catch (err: any) {
      setError(err.message || 'Import failed');
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async (format: 'csv' | 'xlsx') => {
    try {
      const formData = new FormData();
      formData.append('action', `sample-${format}`);

      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `product-import-template.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download template:', err);
    }
  };

  const getMappedRequiredFields = () => {
    const mapped = Object.values(mapping).filter((v) => v !== null);
    return REQUIRED_FIELDS.filter((field) => mapped.includes(field));
  };

  const missingRequiredFields = REQUIRED_FIELDS.filter(
    (field) => !Object.values(mapping).includes(field)
  );

  return (
    <Modal isOpen={isOpen} onClose={() => handleClose()} size="4xl">
      <div className="flex items-center justify-between border-b p-6">
        <div>
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="text-sm text-gray-500">{t('subtitle')}</p>
        </div>
        <button
          onClick={() => handleClose()}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6">
        {/* Steps indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {['upload', 'mapping', 'preview', 'complete'].map((s, index) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    step === s
                      ? 'bg-primary text-white'
                      : ['upload', 'mapping', 'preview', 'complete'].indexOf(step) >
                        index
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {t(`steps.${s}`)}
                </span>
                {index < 3 && (
                  <ArrowRight className="mx-4 h-4 w-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('error')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 transition hover:border-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-2 text-lg font-medium text-gray-700">
                {t('uploadArea.title')}
              </p>
              <p className="text-sm text-gray-500">{t('uploadArea.subtitle')}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-gray-500">{t('downloadTemplate')}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTemplate('csv')}
              >
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTemplate('xlsx')}
              >
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" />
                <span className="ml-3 text-gray-600">{t('parsing')}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === 'mapping' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  <FileSpreadsheet className="mr-2 inline h-4 w-4" />
                  {file?.name} • {totalRows} {t('rows')}
                </p>
              </div>
              {missingRequiredFields.length > 0 && (
                <Badge variant="warning">
                  {t('missingRequired')}: {missingRequiredFields.join(', ')}
                </Badge>
              )}
            </div>

            <div className="max-h-[400px] overflow-auto rounded-lg border">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      {t('csvColumn')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      {t('mapTo')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      {t('sampleData')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {headers.map((header) => (
                    <tr key={header} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium">{header}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={mapping[header] || ''}
                          onChange={(e) =>
                            handleMappingChange(header, e.target.value as ImportableField | '')
                          }
                          className="w-48"
                        >
                          <option value="">{t('doNotImport')}</option>
                          {IMPORTABLE_FIELDS.map((field) => (
                            <option key={field} value={field}>
                              {field}
                              {REQUIRED_FIELDS.includes(field) ? ' *' : ''}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {previewRows[0]?.data[header] || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={resetState}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('back')}
              </Button>
              <Button
                onClick={handleValidate}
                disabled={loading || missingRequiredFields.length > 0}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    {t('validating')}
                  </>
                ) : (
                  <>
                    {t('validate')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Validation Results */}
        {step === 'preview' && validationResult && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {validationResult.stats.total}
                </p>
                <p className="text-sm text-blue-600">{t('stats.total')}</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="text-2xl font-bold text-green-700">
                  {validationResult.stats.valid}
                </p>
                <p className="text-sm text-green-600">{t('stats.valid')}</p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 text-center">
                <p className="text-2xl font-bold text-red-700">
                  {validationResult.stats.invalid}
                </p>
                <p className="text-sm text-red-600">{t('stats.invalid')}</p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-4 text-center">
                <p className="text-2xl font-bold text-yellow-700">
                  {validationResult.stats.warnings}
                </p>
                <p className="text-sm text-yellow-600">{t('stats.warnings')}</p>
              </div>
            </div>

            {/* Action summary */}
            <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
              <Badge variant="success">
                {validationResult.createCount} {t('toCreate')}
              </Badge>
              <Badge variant="default">
                {validationResult.updateCount} {t('toUpdate')}
              </Badge>
            </div>

            {/* Invalid rows */}
            {validationResult.invalidRows.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium text-red-700">
                  <AlertCircle className="mr-2 inline h-4 w-4" />
                  {t('invalidRows')} ({validationResult.invalidRows.length})
                </h4>
                <div className="max-h-48 overflow-auto rounded-lg border border-red-200">
                  <table className="w-full text-sm">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-3 py-2 text-left">{t('table.row')}</th>
                        <th className="px-3 py-2 text-left">{t('table.sku')}</th>
                        <th className="px-3 py-2 text-left">{t('table.errors')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-100">
                      {validationResult.invalidRows.map((row) => (
                        <tr key={row.rowNumber}>
                          <td className="px-3 py-2">{row.rowNumber}</td>
                          <td className="px-3 py-2">{row.sku || '—'}</td>
                          <td className="px-3 py-2 text-red-600">
                            {row.errors.join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Valid rows preview */}
            {validationResult.validRows.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium text-green-700">
                  <CheckCircle className="mr-2 inline h-4 w-4" />
                  {t('validRows')} ({validationResult.validRows.length})
                </h4>
                <div className="max-h-48 overflow-auto rounded-lg border border-green-200">
                  <table className="w-full text-sm">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-3 py-2 text-left">{t('table.row')}</th>
                        <th className="px-3 py-2 text-left">{t('table.sku')}</th>
                        <th className="px-3 py-2 text-left">{t('table.name')}</th>
                        <th className="px-3 py-2 text-left">{t('table.action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-100">
                      {validationResult.validRows.slice(0, 10).map((row) => (
                        <tr key={row.rowNumber}>
                          <td className="px-3 py-2">{row.rowNumber}</td>
                          <td className="px-3 py-2">{row.sku}</td>
                          <td className="px-3 py-2">{row.nameEn}</td>
                          <td className="px-3 py-2">
                            <Badge
                              variant={row.action === 'create' ? 'success' : 'default'}
                            >
                              {row.action}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('mapping')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('back')}
              </Button>
              <Button
                onClick={handleImport}
                disabled={validationResult.stats.valid === 0}
              >
                {t('startImport')} ({validationResult.stats.valid} {t('products')})
              </Button>
            </div>
          </div>
        )}

        {/* Importing */}
        {step === 'importing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">{t('importing')}</p>
            <p className="text-sm text-gray-500">{t('pleaseWait')}</p>
          </div>
        )}

        {/* Complete */}
        {step === 'complete' && importResult && (
          <div className="space-y-6">
            <div className="flex flex-col items-center py-8">
              <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
              <h3 className="text-xl font-semibold text-green-700">
                {t('importComplete')}
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="text-2xl font-bold text-green-700">
                  {importResult.created}
                </p>
                <p className="text-sm text-green-600">{t('result.created')}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {importResult.updated}
                </p>
                <p className="text-sm text-blue-600">{t('result.updated')}</p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 text-center">
                <p className="text-2xl font-bold text-red-700">
                  {importResult.failed}
                </p>
                <p className="text-sm text-red-600">{t('result.failed')}</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium text-red-700">
                  {t('failedRows')}
                </h4>
                <div className="max-h-32 overflow-auto rounded-lg border border-red-200 text-sm">
                  {importResult.errors.map((err) => (
                    <div
                      key={err.rowNumber}
                      className="border-b border-red-100 px-3 py-2 last:border-0"
                    >
                      Row {err.rowNumber} ({err.sku}): {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button onClick={() => handleClose(true)}>
                {t('done')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
