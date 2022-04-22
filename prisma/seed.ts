import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { artistsData } from "./songsData";

// handle database connection

const prisma = new PrismaClient();

const run = async () => {
  await Promise.all(
    artistsData.map(async (artist) => {
      return prisma.artist.upsert({
        where: { name: artist.name },
        update: {},
        create: {
          name: artist.name,
          Avatar: artist.Avatar,
          Songs: {
            create: artist.songs.map((song) => ({
              name: song.name,
              duration: song.duration,
              url: song.url,
            })),
          },
        },
      });
    })
  );

  const salt = bcrypt.genSaltSync();

  const user = await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      email: "user@test.com",
      password: bcrypt.hashSync("password", salt),
      firstName: "Lily",
      lastName: "Luo",
    },
  });

  const songs = await prisma.song.findMany({});
  await Promise.all(
    // create 10 playlist with name of playlist+number
    // which has a user with id and songs with id
    new Array(10).fill(1).map((_, index) => {
      return prisma.playlist.create({
        data: {
          name: `Playlist #${index + 1}`,
          // userId: user.id, 这样不能确保prisma能链接两者,所以如下,也可以使用connectOrCreate()
          user: {
            connect: { id: user.id },
          },
          songs: {
            connect: songs.map((song) => ({
              id: song.id,
            })),
          },
        },
      });
    })
  );
};

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
