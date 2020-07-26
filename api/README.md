# Setup

### Database
```
dnf install postgresql-server libpq-devel postgresql-contrib
postgresql-setup --initdb
systemctl enable postgresql.service
systemctl start postgresql.service

sudo -u postgres psql
> CREATE DATABASE laterlists;
> CREATE USER laterlists WITH ENCRYPTED PASSWORD 'password';
> GRANT ALL PRIVILEGES ON DATABASE laterlists TO laterlists;
> \c laterlists
> CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# Edit the pg_hba.conf (show hba_file) and set auth to md5

psql -h 127.0.0.1 -d laterlists -U laterlists
```
