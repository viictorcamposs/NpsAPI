import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { UsersRepository } from '../repositories/UsersRepository';

class UsersController {
  async create(req: Request, res: Response) {
    const usersRepository = getCustomRepository(UsersRepository);
    const { name, email } = req.body;

    const userAlreadyExists = await usersRepository.findOne({ email })
    if (userAlreadyExists) {
      return res.status(400).json({ error: "User Already Exists" });
    }

    const user = usersRepository.create({ name, email });
    await usersRepository.save(user);
    
    return res.status(201).json(user);
  }
};

export { UsersController };