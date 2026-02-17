import { PrismaClient, UserRole, ArticleStatus, ArticleVisibility } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@organisasi.com' },
    update: {},
    create: {
      email: 'admin@organisasi.com',
      password: adminPassword,
      name: 'Administrator',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create editor user
  const editorPassword = await bcrypt.hash('editor123', 10);
  const editor = await prisma.user.upsert({
    where: { email: 'editor@organisasi.com' },
    update: {},
    create: {
      email: 'editor@organisasi.com',
      password: editorPassword,
      name: 'Editor',
      role: UserRole.EDITOR,
      isActive: true,
    },
  });
  console.log('✅ Created editor user:', editor.email);

  // Create sample articles
  const sampleArticles = [
    {
      title: 'Selamat Datang di Website Organisasi Kami',
      slug: 'selamat-datang',
      content: '<p>Selamat datang di website resmi organisasi kami. Kami berkomitmen untuk memberikan pelayanan terbaik kepada masyarakat.</p><p>Dalam website ini, Anda dapat menemukan berbagai informasi tentang kegiatan dan program kami.</p>',
      excerpt: 'Selamat datang di website resmi organisasi kami. Temukan informasi tentang kegiatan dan program kami.',
      status: ArticleStatus.PUBLISHED,
      visibility: ArticleVisibility.PUBLIC,
      publishedAt: new Date(),
      authorId: admin.id,
    },
    {
      title: 'Program Kerja Tahun 2026',
      slug: 'program-kerja-2026',
      content: '<p>Tahun 2026 menjadi tahun yang penuh tantangan dan peluang. Organisasi kami telah menyiapkan berbagai program kerja untuk melayani masyarakat dengan lebih baik.</p><h3>Program Unggulan</h3><ul><li>Peningkatan kualitas pelayanan</li><li>Pengembangan sumber daya manusia</li><li>Modernisasi infrastruktur</li></ul>',
      excerpt: 'Tahun 2026 menjadi tahun yang penuh tantangan dan peluang. Simak program kerja unggulan kami.',
      status: ArticleStatus.PUBLISHED,
      visibility: ArticleVisibility.PUBLIC,
      publishedAt: new Date(Date.now() - 86400000), // 1 day ago
      authorId: editor.id,
    },
    {
      title: 'Pengumuman Penting',
      slug: 'pengumuman-penting',
      content: '<p>Dengan ini kami sampaikan pengumuman penting terkait kegiatan organisasi. Mohon perhatian seluruh anggota dan masyarakat.</p>',
      excerpt: 'Pengumuman penting terkait kegiatan organisasi. Mohon perhatian seluruh anggota dan masyarakat.',
      status: ArticleStatus.DRAFT,
      visibility: ArticleVisibility.PUBLIC,
      authorId: admin.id,
    },
  ];

  for (const article of sampleArticles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: article,
    });
    console.log('✅ Created article:', article.title);
  }

  // Create default settings
  const defaultSettings = [
    {
      key: 'site_name',
      value: 'Web Profil Organisasi',
      description: 'Nama website',
      isPublic: true,
    },
    {
      key: 'site_description',
      value: 'Website resmi organisasi kami',
      description: 'Deskripsi website',
      isPublic: true,
    },
    {
      key: 'contact_email',
      value: 'contact@organisasi.com',
      description: 'Email kontak',
      isPublic: true,
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
    console.log('✅ Created setting:', setting.key);
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
