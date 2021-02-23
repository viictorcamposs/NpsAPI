import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import User from '../models/User';

class UserController {

  async create(req: Request, res: Response) {
    const usersRepository = getRepository(User); 
    const { name, email } = req.body;

    const userAlreadyExists = await usersRepository.findOne({ email })

    if(userAlreadyExists) {
      return res.status(400).json({ error: "User Already Exists" });
    }

    const user = usersRepository.create({ name, email });
    await usersRepository.save(user);

    return res.json(user);
  }
};

export default UserController;