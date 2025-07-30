'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { uploadFileToS3, getDownloadUrlFromS3 } from '@/lib/s3';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

interface VitrineFormProps {
  usuarioId: string | null;
  vitrineAtual?: any;
  aoSalvar: () => void;
}

export default function VitrineForm({
  usuarioId,
  vitrineAtual,
  aoSalvar,
}: VitrineFormProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (vitrineAtual) {
      setTitulo(vitrineAtual.nome);
      setDescricao(vitrineAtual.descricao);
      setWhatsapp(vitrineAtual.whatsapp);
      setPreviewUrl(vitrineAtual.urlImagem || null);
    } else {
      setTitulo('');
      setDescricao('');
      setWhatsapp('');
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [vitrineAtual]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!usuarioId) return alert('Usuário não identificado.');

    setCarregando(true);

    try {
      let imageUrl = vitrineAtual?.urlImagem || '';

      if (selectedFile) {
        const fileName = `${Date.now()}-${selectedFile.name}`;
        await uploadFileToS3(selectedFile, fileName);
        imageUrl = getDownloadUrlFromS3(fileName);
      }

      const dados = {
        nome: titulo,
        descricao,
        whatsapp,
        urlImagem: imageUrl,
        usuarioId,
        atualizadoEm: serverTimestamp(),
      };

      if (vitrineAtual) {
        const ref = doc(db, 'vitrines', vitrineAtual.id);
        await updateDoc(ref, dados);
      } else {
        const ref = collection(db, 'vitrines');
        await addDoc(ref, {
          ...dados,
          criadoEm: serverTimestamp(),
        });
      }

      aoSalvar();
    } catch (err) {
      console.error('Erro ao salvar vitrine:', err);
      alert('Erro ao salvar vitrine');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Título da vitrine"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        required
        className="w-full border px-3 py-2 rounded"
      />

      <textarea
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        required
        className="w-full border px-3 py-2 rounded"
      />

      <input
        type="text"
        placeholder="WhatsApp com DDD"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        required
        className="w-full border px-3 py-2 rounded"
      />

      {/* Imagem Preview e Seletor */}
      <div className="space-y-2">
        <label
          htmlFor="fileInput"
          className="inline-block bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded cursor-pointer hover:bg-gray-200"
        >
          Escolher imagem
        </label>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {selectedFile && (
          <p className="text-sm text-gray-600">{selectedFile.name}</p>
        )}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-32 h-32 object-cover rounded border"
          />
        )}
        <p className="text-sm text-gray-500">
          Selecione uma imagem que represente sua loja.
        </p>
      </div>

      <button
        type="submit"
        disabled={carregando}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {carregando ? 'Salvando...' : 'Salvar vitrine'}
      </button>
    </form>
  );
}
