import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";
import { MediaId } from "./field-types/media-id";
import { NoneEmptyString } from "../../data/non-empty-string";
import { MIME } from "../../utilities/upload";

@Entity("media")
export class MediaEntity {
  @PrimaryColumn("uuid")
  id!: MediaId;

  @Column()
  name!: NoneEmptyString;

  @Column()
  mime!: MIME;

  @Column()
  size!: number;

  @Column()
  path!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
