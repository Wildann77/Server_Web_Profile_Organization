import 'dotenv/config';
import { PrismaClient, UserRole, ArticleStatus, ArticleVisibility } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@organisasi.com';
  const adminRawPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const editorEmail = process.env.SEED_EDITOR_EMAIL || 'editor@organisasi.com';
  const editorRawPassword = process.env.SEED_EDITOR_PASSWORD || 'editor123';

  // Create admin user
  const adminPassword = await bcrypt.hash(adminRawPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: adminPassword,
      name: 'Administrator',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create editor user
  const editorPassword = await bcrypt.hash(editorRawPassword, 10);
  const editor = await prisma.user.upsert({
    where: { email: editorEmail },
    update: {},
    create: {
      email: editorEmail,
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
      key: 'site_logo',
      value: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Logo_Muhammadiyah.svg/1200px-Logo_Muhammadiyah.svg.png',
      description: 'URL logo website',
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
    {
      key: 'contact_phone',
      value: '',
      description: 'Nomor telepon',
      isPublic: true,
    },
    {
      key: 'contact_address',
      value: '',
      description: 'Alamat kantor',
      isPublic: true,
    },
    {
      key: 'social_facebook',
      value: '',
      description: 'URL Facebook',
      isPublic: true,
    },
    {
      key: 'social_instagram',
      value: '',
      description: 'URL Instagram',
      isPublic: true,
    },
    {
      key: 'social_youtube',
      value: '',
      description: 'URL YouTube',
      isPublic: true,
    },
    // Kontak tambahan
    {
      key: 'contact_whatsapp',
      value: '',
      description: 'Nomor WhatsApp',
      isPublic: true,
    },
    {
      key: 'contact_maps_url',
      value: '',
      description: 'URL embed Google Maps',
      isPublic: true,
    },
    // Jam operasional
    {
      key: 'office_hours_weekday',
      value: '08.00 - 16.00',
      description: 'Jam operasional Senin-Jumat',
      isPublic: true,
    },
    {
      key: 'office_hours_saturday',
      value: '08.00 - 12.00',
      description: 'Jam operasional Sabtu',
      isPublic: true,
    },
    // Visi & Misi
    {
      key: 'org_vision',
      value: 'Terwujudnya masyarakat Islam yang sebenar-benarnya yang diridhai Allah SWT.',
      description: 'Visi organisasi',
      isPublic: true,
    },
    {
      key: 'org_mission_1',
      value: 'Menegakkan keyakinan tauhid yang murni sesuai dengan ajaran Allah SWT yang dibawa oleh para Rasul.',
      description: 'Misi organisasi ke-1',
      isPublic: true,
    },
    {
      key: 'org_mission_2',
      value: 'Menyebarluaskan ajaran Islam yang bersumber pada Al-Qur\'an dan As-Sunnah.',
      description: 'Misi organisasi ke-2',
      isPublic: true,
    },
    {
      key: 'org_mission_3',
      value: 'Mewujudkan amal usaha dan amal shalih dalam kehidupan perseorangan, keluarga, dan masyarakat.',
      description: 'Misi organisasi ke-3',
      isPublic: true,
    },
    // Sejarah
    {
      key: 'history_founding',
      value: 'Muhammadiyah didirikan di Kampung Kauman Yogyakarta pada tanggal 8 Dzulhijjah 1330 H bertepatan dengan tanggal 18 November 1912 M oleh K.H. Ahmad Dahlan.\n\nDi wilayah ini, pergerakan Muhammadiyah dimulai sejak awal abad ke-20 yang dipelopori oleh beberapa tokoh masyarakat setempat. Dengan semangat pembaharuan dan dakwah Islam, organisasi ini terus tumbuh dan memberikan kontribusi nyata bagi umat.',
      description: 'Narasi sejarah awal berdiri',
      isPublic: true,
    },
    {
      key: 'history_development',
      value: 'Seiring berjalannya waktu, berbagai amal usaha mulai didirikan. Mulai dari lembaga pendidikan, kesehatan, hingga sosial yang kini menjadi pusat kegiatan masyarakat.\n\nPeriode kepemimpinan berganti, namun semangat untuk berkhidmat kepada umat tidak pernah pudar. Setiap periode kepengurusan membawa warna dan kemajuan tersendiri bagi perkembangan organisasi.',
      description: 'Narasi masa pengembangan',
      isPublic: true,
    },
    {
      key: 'history_present',
      value: 'Saat ini, Muhammadiyah di wilayah terus beradaptasi dengan tantangan zaman. Digitalisasi dakwah, pemberdayaan ekonomi umat, dan peningkatan kualitas pendidikan menjadi fokus utama pergerakan.',
      description: 'Narasi masa kini',
      isPublic: true,
    },
    // Hero
    {
      key: 'hero_image_url',
      value: '/hero-cover.png',
      description: 'URL gambar hero halaman utama (Cloudinary atau path lokal)',
      isPublic: true,
    },
    {
      key: 'hero_subtitle',
      value: 'Bersama membangun masyarakat Islam yang sebenar-benarnya — melalui dakwah, pendidikan, dan amal sosial.',
      description: 'Subtitle hero halaman utama',
      isPublic: true,
    },
  ];


  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {
        description: setting.description,
        isPublic: setting.isPublic,
      },
      create: setting,
    });
    console.log('✅ Synced setting:', setting.key);
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
