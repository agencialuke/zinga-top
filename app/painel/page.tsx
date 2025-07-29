// PainelPage.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import VitrineForm from './VitrineForm';

interface Vitrine {
  id: string;
  nome: string;
  descricao: string;
  urlImagem: string;
  whatsapp: string;
  usuarioId: string;
}

export default function PainelPage() {
  const router = useRouter();
  const [vitrines, setVitrines] = useState<Vitrine[]>([]);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [editando, setEditando] = useState<Vitrine | null>(null);
  const [email, setEmail] = useState('');
  const [plano, setPlano] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUsuarioId(user.uid);
        setEmail(user.email || '');

        const userRef = doc(db, 'usuarios', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setPlano(snap.data().plano || 'gratuito');
        }

        carregarVitrines(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const carregarVitrines = async (uid: string) => {
    const ref = collection(db, 'vitrines');
    const q = query(ref, where('usuarioId', '==', uid));
    const snapshot = await getDocs(q);
    const dados = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Vitrine[];
    setVitrines(dados);
  };

  const handleEditar = (vitrine: Vitrine) => setEditando(vitrine);

  const handleExcluir = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta vitrine?')) {
      await deleteDoc(doc(db, 'vitrines', id));
      if (usuarioId) carregarVitrines(usuarioId);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Painel do Lojista</h1>
          <p className="text-gray-600 text-sm mt-1">
            Olá, {email} — Você está logado como usuário{' '}
            <strong>{plano.toUpperCase()}</strong>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Sair
        </button>
      </div>

      <VitrineForm
        usuarioId={usuarioId}
        vitrineAtual={editando}
        aoSalvar={() => {
          setEditando(null);
          if (usuarioId) carregarVitrines(usuarioId);
        }}
      />

      <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-700">Minhas Vitrines</h2>
      <div className="space-y-4">
        {vitrines.map((v) => (
          <div key={v.id} className="border p-4 rounded-lg shadow-sm bg-white">
            <div className="flex items-center gap-4">
              <img src={v.urlImagem} alt={v.nome} className="w-20 h-20 object-cover rounded" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{v.nome}</h3>
                <p className="text-gray-600">{v.descricao}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleEditar(v)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
              >
                Editar
              </button>
              <button
                onClick={() => handleExcluir(v.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
