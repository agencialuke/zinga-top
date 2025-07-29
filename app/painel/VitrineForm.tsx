'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { uploadFileToS3, getDownloadUrlFromS3 } from '@/lib/s3'; // Certifique-se que estas funções existem
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
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (vitrineAtual) {
      setTitulo(vitrineAtual.nome);
      setDescricao(vitrineAtual.descricao);
      setWhatsapp(vitrineAtual.whatsapp);
    } else {
      setTitulo('');
      setDescricao('');
      setWhatsapp('');
      setSelectedFile(null);
    }
  }, [vitrineAtual]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
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

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full"
      />

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
