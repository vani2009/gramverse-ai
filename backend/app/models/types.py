from sqlalchemy import String, TypeDecorator
import geoalchemy2


class SafeGeometry(TypeDecorator):
    """
    Transparent Geometry TypeDecorator that compiles to:
    - PostGIS geoalchemy2.Geometry('POINT', srid=4326) on PostgreSQL
    - Standard String column on SQLite (for test runs without SpatiaLite C-extension)
    """
    impl = String
    cache_ok = True

    def __init__(self, geometry_type="POINT", srid=4326, **kwargs):
        super().__init__()
        self.geometry_type = geometry_type
        self.srid = srid
        self.geo_type = geoalchemy2.Geometry(geometry_type=geometry_type, srid=srid, **kwargs)

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(self.geo_type)
        return dialect.type_descriptor(String(255))
