import React, { useState, useEffect } from 'react';
import { EtlLogItem } from '../types';
import {
  UploadCloud,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  FolderArchive,
  Layers,
  Database,
  Check,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const UFS = [
  'BR', 'PA', 'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MG', 'MS', 'MT', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

type TipoUpload = 'csv_candidatos' | 'csv_zonas_demografia' | 'lote_imagens';

export const AdminEtlUpload: React.FC = () => {
  const [tipoUpload, setTipoUpload] = useState<TipoUpload>('csv_candidatos');
  const [selectedUf, setSelectedUf] = useState('PA');
  const [selectedAno, setSelectedAno] = useState(2026);
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileCount, setFileCount] = useState(0);

  // Progress state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressStatusText, setProgressStatusText] = useState('');
  const [uploadResult, setUploadResult] = useState<{
    tipo: 'sucesso' | 'erro';
    mensagem: string;
    detalhes?: any;
  } | null>(null);

  // Logs
  const [etlLogs, setEtlLogs] = useState<EtlLogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    carregarEtlLogs();
  }, []);

  const carregarEtlLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/v1/etl/logs');
      if (res.ok) {
        const data = await res.json();
        setEtlLogs(data);
      }
    } catch {}
    finally {
      setIsLoadingLogs(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (tipoUpload === 'lote_imagens') {
      setFileName(`${files.length} imagens selecionadas (Lote TSE ${selectedUf})`);
      setFileCount(files.length);
      setUploadResult(null);
      return;
    }

    const file = files[0];
    setFileName(file.name);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    if (tipoUpload === 'lote_imagens') {
      setFileName(`${files.length} imagens soltas para lote`);
      setFileCount(files.length);
      setUploadResult(null);
      return;
    }

    const file = files[0];
    setFileName(file.name);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
    };
    reader.readAsText(file);
  };

  const handleProcessarUpload = async () => {
    if (tipoUpload !== 'lote_imagens' && !csvContent.trim()) {
      setUploadResult({
        tipo: 'erro',
        mensagem: 'Por favor, selecione um arquivo CSV ou cole o conteúdo no formulário.'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(5);
    setProgressStatusText('Lendo estrutura do arquivo...');
    setUploadResult(null);

    // Simulated stepped upload with actual API execution
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 85) {
          clearInterval(interval);
          return 88;
        }
        if (prev === 20) setProgressStatusText('Validando cabeçalhos e campos oficiais TSE...');
        if (prev === 50) setProgressStatusText('Normalizando codificação e cruzando coligações/chapas...');
        if (prev === 75) setProgressStatusText('Indexando registros na base de dados persistente...');
        return prev + 12;
      });
    }, 180);

    try {
      const res = await fetch('/api/v1/etl/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: tipoUpload,
          csvContent: csvContent || 'dummy',
          uf: selectedUf,
          ano: selectedAno,
          arquivoNome: fileName || `arquivo_${tipoUpload}_${selectedUf}.csv`,
          totalArquivos: fileCount || 30
        })
      });

      clearInterval(interval);
      setUploadProgress(100);
      setProgressStatusText('Concluído!');

      const data = await res.json();
      if (res.ok) {
        setUploadResult({
          tipo: 'sucesso',
          mensagem: data.mensagem || 'Dados integrados com sucesso à base da plataforma!'
        });
        carregarEtlLogs();
      } else {
        setUploadResult({
          tipo: 'erro',
          mensagem: data.error || 'Erro durante o processamento do arquivo.'
        });
      }
    } catch (err: any) {
      clearInterval(interval);
      setUploadProgress(100);
      setUploadResult({
        tipo: 'erro',
        mensagem: `Erro na transmissão: ${err.message}`
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
      }, 500);
    }
  };

  const handleCarregarExemplo = () => {
    if (tipoUpload === 'csv_candidatos') {
      const sample = `ANO_ELEICAO;SG_UF;CD_CARGO;DS_CARGO;SQ_CANDIDATO;NR_CANDIDATO;NM_CANDIDATO;NM_URNA_CANDIDATO;DS_SITUACAO_CANDIDATURA;SG_PARTIDO;NM_PARTIDO;DS_COMPOSICAO_COLIGACAO;NM_URNA_VICE
2026;PA;3;GOVERNADOR;140001928374;15;HELDER ZAHLUTH BARBALHO;HELDER;DEFERIDO;MDB;MOVIMENTO DEMOCRATICO BRASILEIRO;FEDERAÇÃO BRASIL DA ESPERANÇA;HANA GHASSAN
2026;PA;3;GOVERNADOR;140001928375;22;JOAQUIM PASSARINHO;PASSARINHO;DEFERIDO;PL;PARTIDO LIBERAL;PL / PP / REPUBLICANOS;CRISTIANO VALE
2026;PA;5;SENADOR;140001928376;130;BETO FARO;BETO FARO;DEFERIDO;PT;PARTIDO DOS TRABALHADORES;FEDERAÇÃO PT PCdoB PV;PAULO ROCHA
2026;PA;6;DEPUTADO FEDERAL;140001928377;1515;ALESSANDRA HABER;DRA ALESSANDRA HABER;DEFERIDO;MDB;MOVIMENTO DEMOCRATICO BRASILEIRO;PARTIDO ISOLADO;
2026;PA;7;DEPUTADO ESTADUAL;140001928378;12345;RODRIGO CUNHA;RODRIGO CUNHA;DEFERIDO;PDT;PARTIDO DEMOCRATICO TRABALHISTA;PDT ISOLADO;`;
      setCsvContent(sample);
      setFileName(`consulta_cand_2026_${selectedUf}_exemplo.csv`);
      setUploadResult(null);
    } else if (tipoUpload === 'csv_zonas_demografia') {
      const sample = `UF;MUNICIPIO;ZONA_ELEITORAL;SECAO;TOTAL_ELEITORES;FAIXA_ETARIA_PREDOMINANTE;PERCENT_FEMININO
PA;BELÉM;001;0120;420;30_39_ANOS;52.4
PA;BELÉM;001;0121;385;40_49_ANOS;53.1
PA;ANANINDEUA;043;0015;390;25_34_ANOS;51.8
PA;SANTARÉM;020;0044;410;18_24_ANOS;50.5
PA;MARABÁ;023;0089;375;30_39_ANOS;49.2`;
      setCsvContent(sample);
      setFileName(`zonas_eleitorais_ibge_${selectedUf}.csv`);
      setUploadResult(null);
    } else {
      setFileName(`lote_fotos_oficiais_tse_${selectedUf}.zip`);
      setFileCount(45);
      setUploadResult(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Selector of Upload Type */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#0B3D91]" />
          <span>1. Selecione a Categoria do Arquivo para Ingestão</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Option 1: CSV Candidatos */}
          <button
            type="button"
            onClick={() => {
              setTipoUpload('csv_candidatos');
              setUploadResult(null);
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              tipoUpload === 'csv_candidatos'
                ? 'border-[#0B3D91] bg-blue-50/40 shadow-xs ring-2 ring-[#0B3D91]/20'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  tipoUpload === 'csv_candidatos' ? 'bg-[#0B3D91] text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                {tipoUpload === 'csv_candidatos' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0B3D91]" />
                )}
              </div>
              <h4 className="font-black text-slate-900 text-xs">Candidatos TSE (CSV)</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Tabela oficial <code className="text-[#0B3D91] font-mono">consulta_cand</code> com chapas, vices, partidos e suplentes.
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#0B3D91] mt-3 block">Alimenta Urna e Pesquisas</span>
          </button>

          {/* Option 2: CSV Zonas & Demografia */}
          <button
            type="button"
            onClick={() => {
              setTipoUpload('csv_zonas_demografia');
              setUploadResult(null);
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              tipoUpload === 'csv_zonas_demografia'
                ? 'border-[#0B3D91] bg-blue-50/40 shadow-xs ring-2 ring-[#0B3D91]/20'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  tipoUpload === 'csv_zonas_demografia' ? 'bg-[#0B3D91] text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Layers className="w-5 h-5" />
                </div>
                {tipoUpload === 'csv_zonas_demografia' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0B3D91]" />
                )}
              </div>
              <h4 className="font-black text-slate-900 text-xs">Zonas & Demografia IBGE</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Amostragem estratificada proporcional por sexo, idade e municípios.
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#0B3D91] mt-3 block">Alimenta IA e Estratificação</span>
          </button>

          {/* Option 3: Lote de Imagens */}
          <button
            type="button"
            onClick={() => {
              setTipoUpload('lote_imagens');
              setUploadResult(null);
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              tipoUpload === 'lote_imagens'
                ? 'border-[#0B3D91] bg-blue-50/40 shadow-xs ring-2 ring-[#0B3D91]/20'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  tipoUpload === 'lote_imagens' ? 'bg-[#0B3D91] text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  <FolderArchive className="w-5 h-5" />
                </div>
                {tipoUpload === 'lote_imagens' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0B3D91]" />
                )}
              </div>
              <h4 className="font-black text-slate-900 text-xs">Lote de Fotos TSE (.ZIP/IMG)</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Arquivos nominais de fotos oficiais de candidatos no padrão <code className="text-[#0B3D91] font-mono">[UF]_[CARGO]_[NUMERO].jpg</code>.
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#0B3D91] mt-3 block">Vincula Fotos na Urna</span>
          </button>
        </div>
      </div>

      {/* Upload Dropzone & Configuration */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-[#0B3D91]" />
            <span>2. Configuração e Envio do Arquivo</span>
          </h3>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Estado / Abrangência:</span>
              <select
                value={selectedUf}
                onChange={e => setSelectedUf(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 cursor-pointer"
              >
                {UFS.map(uf => (
                  <option key={uf} value={uf}>
                    {uf === 'BR' ? 'Brasil (Nacional / Presidência)' : uf}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Ano Eleitoral:</span>
              <input
                type="number"
                value={selectedAno}
                onChange={e => setSelectedAno(Number(e.target.value))}
                className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 text-center"
              />
            </div>
          </div>
        </div>

        {/* Dropzone Area */}
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 hover:border-[#0B3D91] bg-slate-50/70 hover:bg-blue-50/20 rounded-2xl p-8 text-center transition-all cursor-pointer relative group"
        >
          <input
            type="file"
            id="file-upload-input"
            onChange={handleFileChange}
            multiple={tipoUpload === 'lote_imagens'}
            accept={tipoUpload === 'lote_imagens' ? 'image/*,.zip' : '.csv,.txt'}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0B3D91] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              {tipoUpload === 'lote_imagens' ? (
                <ImageIcon className="w-6 h-6" />
              ) : (
                <FileSpreadsheet className="w-6 h-6" />
              )}
            </div>
            <div className="text-sm font-black text-slate-800">
              {fileName ? fileName : 'Arraste e solte o arquivo aqui ou clique para selecionar'}
            </div>
            <p className="text-xs text-slate-500">
              {tipoUpload === 'lote_imagens'
                ? 'Suporta arquivos .ZIP com as fotos ou seleção de múltiplos arquivos JPG/PNG'
                : 'Arquivos CSV com separador ponto e vírgula (;) e cabeçalho oficial do TSE'}
            </p>
          </div>
        </div>

        {/* Action Controls & Sample Data */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleCarregarExemplo}
            className="text-xs font-bold text-[#0B3D91] hover:text-[#123F8F] flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Carregar amostra de dados de exemplo ({selectedUf})</span>
          </button>

          <button
            type="button"
            onClick={handleProcessarUpload}
            disabled={isUploading}
            className="flex items-center gap-2 bg-[#0B3D91] hover:bg-[#123F8F] text-white px-6 py-3 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50 ml-auto"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isUploading ? 'Processando...' : 'Iniciar Ingestão no Banco de Dados'}</span>
          </button>
        </div>

        {/* Progress Preloader */}
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-blue-50 rounded-2xl border border-blue-200 space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-black text-[#0B3D91]">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#0B3D91]" />
                <span>{progressStatusText}</span>
              </span>
              <span>{uploadProgress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-blue-200/60 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-[#0B3D91] to-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-600 block">
              Não feche o navegador enquanto a carga de dados estiver sendo persistida.
            </span>
          </motion.div>
        )}

        {/* Result Message Banner */}
        {uploadResult && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-3 ${
              uploadResult.tipo === 'sucesso'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            {uploadResult.tipo === 'sucesso' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-extrabold text-sm">
                {uploadResult.tipo === 'sucesso' ? 'Upload Concluído com Sucesso!' : 'Falha no Processamento'}
              </div>
              <p className="mt-1">{uploadResult.mensagem}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* History of ETL Executions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Histórico de Uploads e Ingestões Realizadas</span>
          </div>
          <button
            onClick={carregarEtlLogs}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 cursor-pointer"
            title="Recarregar logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {etlLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-semibold">
            Nenhum lote de dados processado até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Arquivo / Tipo</th>
                  <th className="py-3 px-4">UF / Ano</th>
                  <th className="py-3 px-4">Registros Inseridos</th>
                  <th className="py-3 px-4">Rejeitados</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Data / Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {etlLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {log.arquivo}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {log.uf} • {log.ano}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {log.inseridos} itens
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-500">
                      {log.rejeitados}
                    </td>
                    <td className="py-3 px-4">
                      {log.status === 'sucesso' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Sucesso</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>Erro</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
